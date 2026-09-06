'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { useRequireAuth } from '@/lib/auth';
import { Mic, CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function VoiceEntryPage() {
  const { user } = useRequireAuth(['VENDOR']);
  const [transcript, setTranscript] = useState("Today I sold vegetables worth 4500 rupees and spent 1800 on stock.");
  const [parsedData, setParsedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleProcessVoice = async () => {
    setLoading(true);
    setSaved(false);
    setError(null);
    try {
      const result = await api.postVoiceTransaction(transcript);
      setParsedData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSave = async () => {
    if (!parsedData || !user?.vendor_id) return;
    try {
      const vendorId = user.vendor_id;
      await api.addTransaction(vendorId, {
        amount: parsedData.sales,
        transaction_type: "SALE",
        payment_method: "CASH",
        source: "VOICE",
        confidence_score: parsedData.confidence
      });
      if (parsedData.expenses > 0) {
        await api.addExpense(vendorId, {
          category: parsedData.category || "STOCK",
          amount: parsedData.expenses,
          description: "Voice diary stock expense",
          source: "VOICE"
        });
      }
      setSaved(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to save entry');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 font-mono">
      <Link href="/vendor/dashboard" className="text-xs font-black uppercase text-gray-500 hover:text-brandRed flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" /> BACK TO DASHBOARD
      </Link>

      <div className="brutal-card p-6 space-y-6 border-l-8 border-l-brandRed">
        <div>
          <span className="brutal-badge bg-brandRed text-white">VOICE NLP AI</span>
          <h1 className="text-2xl font-black uppercase text-black dark:text-white mt-1 flex items-center gap-2">
            <Mic className="w-6 h-6 text-brandRed" /> VOICE FINANCIAL ENTRY
          </h1>
          <p className="text-xs text-gray-500 font-semibold">Speak daily sales and stock expenses naturally in Hindi or English</p>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black uppercase text-black dark:text-white">SPOKEN SPEECH TRANSCRIPT / MIC INPUT</label>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            className="w-full h-28 p-3 bg-lightSurface2 dark:bg-darkSurface2 border-2 border-black dark:border-white text-sm font-semibold text-black dark:text-white focus:outline-none focus:border-brandRed"
          />
        </div>

        <button
          onClick={handleProcessVoice}
          disabled={loading}
          className="brutal-btn w-full py-3.5 bg-brandRed text-white text-xs"
        >
          {loading ? 'EXTRACTING FINANCIAL ENTITIES...' : 'PROCESS VOICE ENTRY (NLP AI)'}
        </button>

        {/* Extracted Confirmation Card */}
        {parsedData && (
          <div className="brutal-card p-5 space-y-4 bg-lightSurface2 dark:bg-darkSurface2 border-l-4 border-l-brandRed">
            <div className="flex items-center justify-between border-b-2 border-black dark:border-white pb-3">
              <span className="text-xs font-black uppercase text-brandRed">AI EXTRACTED FINANCIAL RECORD</span>
              <span className="brutal-badge bg-black text-white dark:bg-white dark:text-black">
                CONFIDENCE: {(parsedData.confidence * 100).toFixed(0)}%
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-bold text-gray-500 uppercase">EXTRACTED REVENUE</div>
                <div className="text-2xl font-black text-black dark:text-white">₹{parsedData.sales.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs font-bold text-gray-500 uppercase">EXTRACTED STOCK EXPENSE</div>
                <div className="text-2xl font-black text-brandRed">₹{parsedData.expenses.toLocaleString()}</div>
              </div>
            </div>

            <div className="text-xs font-bold text-gray-500 uppercase">
              CATEGORY: <strong className="text-black dark:text-white">{parsedData.category}</strong>
            </div>

            {!saved ? (
              <button
                onClick={handleConfirmSave}
                className="brutal-btn w-full py-3 bg-black text-white dark:bg-white dark:text-black text-xs flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4 text-brandRed" /> CONFIRM & SAVE TO DATABASE
              </button>
            ) : (
              <div className="brutal-card-red p-3 text-xs font-black text-center flex items-center justify-center gap-2 uppercase">
                <CheckCircle className="w-4 h-4" /> SUCCESSFULLY SAVED TO DATABASE!
              </div>
            )}
            {error && (
              <div className="p-3 text-xs font-black text-center uppercase text-brandRed border-2 border-brandRed">
                {error}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
