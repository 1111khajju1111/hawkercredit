import re
from typing import Dict, Any


def _extract_amount(text: str, keywords: list[str]) -> float:
    """
    Finds an amount close to one of the supplied keywords.

    Supports English, Hindi and Telugu financial speech.
    """

    if not text:
        return 0.0

    # Normalize commas used in amounts such as 4,500
    normalized = text.replace(",", "")

    # Number followed by keyword
    for keyword in keywords:
        pattern = rf"(\d+(?:\.\d+)?)\s*(?:rupees?|rs\.?|₹)?\s*.{{0,40}}{re.escape(keyword)}"
        match = re.search(pattern, normalized, re.IGNORECASE)

        if match:
            try:
                return float(match.group(1))
            except ValueError:
                pass

    # Keyword followed by number
    for keyword in keywords:
        pattern = rf"{re.escape(keyword)}.{{0,60}}?(\d+(?:\.\d+)?)"
        match = re.search(pattern, normalized, re.IGNORECASE)

        if match:
            try:
                return float(match.group(1))
            except ValueError:
                pass

    return 0.0


def parse_voice_transaction(transcript: str) -> Dict[str, Any]:
    """
    Multilingual NLP parser for financial voice diary entries.

    Supports:
    - English
    - Hindi
    - Telugu

    Example English:
    "Today I sold vegetables worth 4500 rupees and spent 1800 on stock."

    Example Hindi:
    "आज मैंने सब्जियां बेचकर 4500 रुपये कमाए और स्टॉक पर 1800 रुपये खर्च किए।"

    Example Telugu:
    "ఈ రోజు కూరగాయలు అమ్మి 4500 రూపాయలు సంపాదించాను మరియు స్టాక్ కోసం 1800 ఖర్చు చేశాను."
    """

    if not transcript:
        return {
            "sales": 0.0,
            "expenses": 0.0,
            "category": "GENERAL",
            "confidence": 0.0,
            "raw_transcript": transcript,
        }

    text = transcript.strip()
    text_lower = text.lower()

    # ---------------------------------------------------------
    # SALES / REVENUE KEYWORDS
    # ---------------------------------------------------------

    sales_keywords = [
        # English
        "sold",
        "sale",
        "sales",
        "earned",
        "earn",
        "revenue",
        "income",
        "made",

        # Hindi
        "बेचा",
        "बेची",
        "बेचकर",
        "बिक्री",
        "कमाया",
        "कमाई",
        "आय",
        "मुनाफा",

        # Telugu
        "అమ్మాను",
        "అమ్మాను",
        "అమ్మి",
        "అమ్మకం",
        "అమ్మకాలు",
        "ఆదాయం",
        "సంపాదించాను",
        "సంపాదించాను",
        "సంపాదన",
        "వచ్చింది",
    ]

    # ---------------------------------------------------------
    # EXPENSE KEYWORDS
    # ---------------------------------------------------------

    expense_keywords = [
        # English
        "spent",
        "expense",
        "expenses",
        "purchased",
        "purchase",
        "cost",
        "bought",
        "paid",
        "pay",

        # Hindi
        "खर्च",
        "खर्चा",
        "खरीदा",
        "खरीद",
        "भुगतान",
        "दिया",
        "लागत",

        # Telugu
        "ఖర్చు",
        "ఖర్చు చేశాను",
        "ఖర్చుచేశాను",
        "కొన్నాను",
        "కొనుగోలు",
        "చెల్లించాను",
        "చెల్లింపు",
        "ధర",
        "వ్యయం",
    ]

    sales = _extract_amount(text_lower, sales_keywords)
    expenses = _extract_amount(text_lower, expense_keywords)

    # ---------------------------------------------------------
    # FALLBACK: IF WE HAVE TWO NUMBERS
    # First number = sales
    # Second number = expense
    # ---------------------------------------------------------

    if sales == 0.0 or expenses == 0.0:
        all_numbers = re.findall(r"\d+(?:,\d{3})*(?:\.\d+)?", text)

        amounts = []

        for number in all_numbers:
            try:
                value = float(number.replace(",", ""))

                if value > 0:
                    amounts.append(value)
            except ValueError:
                continue

        if len(amounts) >= 2:
            if sales == 0.0:
                sales = amounts[0]

            if expenses == 0.0:
                expenses = amounts[1]

        elif len(amounts) == 1:
            if sales == 0.0:
                sales = amounts[0]

    # ---------------------------------------------------------
    # CATEGORY DETECTION
    # ---------------------------------------------------------

    category = "GENERAL"

    produce_keywords = [
        # English
        "vegetable",
        "vegetables",
        "fruit",
        "fruits",
        "produce",
        "sabzi",

        # Hindi
        "सब्जी",
        "सब्जियां",
        "सब्ज़ी",
        "फल",

        # Telugu
        "కూరగాయ",
        "కూరగాయలు",
        "పండ్లు",
        "పండు",
    ]

    food_keywords = [
        # English
        "tea",
        "chai",
        "milk",
        "sugar",
        "snack",
        "snacks",
        "food",

        # Hindi
        "चाय",
        "दूध",
        "चीनी",
        "नाश्ता",
        "खाना",

        # Telugu
        "టీ",
        "పాలు",
        "చక్కెర",
        "స్నాక్స్",
        "ఆహారం",
    ]

    stock_keywords = [
        # English
        "stock",
        "wholesale",
        "inventory",
        "material",
        "materials",

        # Hindi
        "स्टॉक",
        "थोक",
        "सामान",
        "माल",

        # Telugu
        "స్టాక్",
        "హోల్‌సేల్",
        "హోల్ సేల్",
        "ఇన్వెంటరీ",
        "సామాను",
        "సరుకు",
        "మెటీరియల్",
    ]

    if any(keyword in text_lower for keyword in produce_keywords):
        category = "PRODUCE"

    elif any(keyword in text_lower for keyword in food_keywords):
        category = "BEVERAGES_FOOD"

    elif any(keyword in text_lower for keyword in stock_keywords):
        category = "STOCK"

    # ---------------------------------------------------------
    # CONFIDENCE
    # ---------------------------------------------------------

    if sales > 0 and expenses > 0:
        confidence = 0.96
    elif sales > 0 or expenses > 0:
        confidence = 0.85
    else:
        confidence = 0.40

    return {
        "sales": sales,
        "expenses": expenses,
        "category": category,
        "confidence": confidence,
        "raw_transcript": transcript,
    }
