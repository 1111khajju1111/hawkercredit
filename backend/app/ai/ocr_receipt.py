import re
from datetime import datetime
from typing import Dict, Any, Optional

# Real OCR is attempted whenever pytesseract + Pillow are installed AND actual
# image bytes were uploaded. Neither is guaranteed in every deployment (Tesseract
# is a system binary, not just a Python package), so this always degrades
# gracefully -- but critically, the response tells the caller which path was
# taken via `extraction_method`. Nothing in this module claims "AI OCR read
# your receipt" when what actually happened is the deterministic demo fallback.
_AMOUNT_PATTERN = re.compile(r"(?:rs\.?|inr|₹)\s*([\d,]+(?:\.\d{1,2})?)", re.IGNORECASE)
_CATEGORY_KEYWORDS = {
    "INVENTORY_PURCHASE": ["vegetable", "mandi", "apmc", "produce", "onion", "potato", "tomato"],
    "RAW_MATERIALS": ["milk", "dairy", "curd", "paneer"],
    "STOCK": ["wholesale", "packaging", "gas", "cylinder", "supply"],
}


def _try_real_ocr(image_bytes: bytes) -> Optional[Dict[str, Any]]:
    """
    Attempts genuine OCR text extraction via pytesseract. Returns None (never
    raises) if the dependency isn't installed, the Tesseract binary isn't on
    PATH, or extraction fails for any reason -- the caller falls back to the
    deterministic demo parser in that case.
    """
    try:
        import io
        import pytesseract
        from PIL import Image

        image = Image.open(io.BytesIO(image_bytes))
        raw_text = pytesseract.image_to_string(image)
        if not raw_text or not raw_text.strip():
            return None

        amount_match = _AMOUNT_PATTERN.search(raw_text)
        amount = float(amount_match.group(1).replace(",", "")) if amount_match else None
        if amount is None:
            # No confidently-extracted amount -- not useful as a ledger candidate,
            # fall back rather than return a guess dressed up as a real reading.
            return None

        text_lower = raw_text.lower()
        category = "STOCK"
        for cat, keywords in _CATEGORY_KEYWORDS.items():
            if any(kw in text_lower for kw in keywords):
                category = cat
                break

        # Merchant guess: first non-empty line of the extracted text, if any.
        lines = [ln.strip() for ln in raw_text.splitlines() if ln.strip()]
        merchant = lines[0][:80] if lines else "Unrecognized Merchant"

        return {
            "merchant": merchant,
            "amount": amount,
            "category": category,
            "date": datetime.utcnow().strftime("%Y-%m-%d"),
            # Confidence is deliberately conservative for real OCR -- text
            # extraction from a photographed receipt is noisy, unlike the
            # deterministic demo path's fixed value.
            "confidence": 0.65,
            "items": [],
            "extraction_method": "TESSERACT_OCR",
            "raw_text_preview": raw_text.strip()[:200],
        }
    except Exception:
        return None


def _deterministic_demo_parse(filename: str) -> Dict[str, Any]:
    """
    Deterministic, filename-keyed receipt simulation used for reproducible demo
    walkthroughs and as the fallback when real OCR isn't available or didn't
    confidently extract an amount. Explicitly labeled as such in its own output
    (`extraction_method`) -- this is never presented as a genuine reading of an
    arbitrary receipt image.
    """
    today_str = datetime.utcnow().strftime("%Y-%m-%d")
    fname = filename.lower()

    if "vegetable" in fname or "mandi" in fname:
        merchant, amount, category = "APMC Mandi Wholesale", 4850.0, "INVENTORY_PURCHASE"
        items, confidence = ["Onions 50kg", "Potatoes 40kg", "Tomatoes 20kg"], 0.96
    elif "milk" in fname or "dairy" in fname:
        merchant, amount, category = "Amul Dairy Distributor", 1800.0, "RAW_MATERIALS"
        items, confidence = ["Full Cream Milk 30L", "Curd 10kg"], 0.92
    else:
        merchant, amount, category = "City Wholesale Market", 2450.0, "STOCK"
        items, confidence = ["Packaging Material", "Gas Cylinder Refill"], 0.89

    return {
        "merchant": merchant,
        "amount": amount,
        "category": category,
        "date": today_str,
        "confidence": confidence,
        "items": items,
        "extraction_method": "DETERMINISTIC_DEMO_FALLBACK",
        "raw_text_preview": None,
    }


def parse_receipt_image(image_bytes: bytes = None, filename: str = "") -> Dict[str, Any]:
    """
    Receipt ingestion entry point. Tries genuine OCR on the uploaded image bytes
    first; only falls back to the deterministic filename-keyed demo parser when
    real extraction isn't possible in this environment or didn't yield a usable
    amount. Either way, the caller (frontend, decision trace, audit log) can see
    exactly which path produced the result via `extraction_method` -- and, per
    the OCR-must-never-auto-post-to-ledger rule, this function ONLY returns a
    PENDING candidate; nothing here writes to the transaction/expense ledger.
    """
    if image_bytes:
        real_result = _try_real_ocr(image_bytes)
        if real_result is not None:
            return real_result

    return _deterministic_demo_parse(filename or "receipt.jpg")
