'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useRequireAuth } from '@/lib/auth';
import { ShieldCheck, CheckCircle2, AlertTriangle, BarChart2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreditProfilePage() {
  const { user, loading: authLoading } = useRequireAuth(['VENDOR']);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (authLoading || !user?.vendor_id) return;
    async function load(vendorId: string) {
      const data = await api.getCreditProfile(vendorId);
      setProfile(data);
    }
    load(user.vendor_id as string);
  }, [authLoading, user]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-mono">
      <Link href="/vendor/dashboard" className="text-xs font-black uppercase text-gray-500 hover:text-brandRed flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" /> BACK TO DASHBOARD
      </Link>

      {/* Main Score Header */}
      <div className="brutal-card p-8 border-l-8 border-l-brandRed space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="brutal-badge bg-black text-white dark:bg-white dark:text-black">EXPLAINABLE AI CREDIT PROFILE</span>
            <h1 className="text-3xl font-black uppercase text-black dark:text-white mt-1">{profile?.name || 'Ramesh Kumar'}</h1>
            <p className="text-xs text-gray-500 font-bold">{profile?.business_type} • {profile?.location}</p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-black text-black dark:text-white">{profile?.score ?? 'N/A'} <span className="text-xs text-gray-500 font-semibold">/ 900</span></div>
            <span className="brutal-badge bg-brandRed text-white mt-2 inline-block">
              {profile?.risk_category || 'LOW_MODERATE'} RISK
            </span>
          </div>
        </div>

        <div className="p-3 bg-lightSurface2 dark:bg-darkSurface2 border border-black dark:border-white text-xs font-bold text-black dark:text-white uppercase">
          <strong className="text-brandRed">[MODEL GOVERNANCE]:</strong> PERSISTED RANDOM FOREST CLASSIFIER MODEL ({profile?.model_version || 'v3.0.0-RF-Classifier-Persisted'}). RE-EVALUATES DETERMINISTICALLY ON CONSENTED DAILY TRANSACTIONS.
        </div>
        {profile?.disclaimer && (
          <p className="text-[10px] font-semibold text-gray-500 normal-case">{profile.disclaimer}</p>
        )}
      </div>

      {/* "Why this score?" Panel with SHAP Feature Importance */}
      <div className="brutal-card p-6 space-y-4">
        <h2 className="text-lg font-black uppercase text-black dark:text-white flex items-center gap-2 border-b-2 border-black dark:border-white pb-3">
          <BarChart2 className="w-5 h-5 text-brandRed" /> WHY THIS SCORE? (SHAP FEATURE IMPORTANCE BREAKDOWN)
        </h2>
        <div className="space-y-3">
          {profile?.positive_factors?.concat(profile?.watch_factors || [])?.map((fact: any, idx: number) => (
            <div key={idx} className="p-3.5 bg-lightSurface2 dark:bg-darkSurface2 border border-black dark:border-white space-y-1">
              <div className="flex items-center justify-between text-xs font-black">
                <span className="text-black dark:text-white uppercase">{fact.title}</span>
                <span className={fact.impact?.includes('+') ? 'text-brandRed' : 'text-black dark:text-white bg-black dark:bg-white text-white dark:text-black px-1.5'}>
                  {fact.impact}
                </span>
              </div>
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">{fact.detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Positive Drivers & Watch Factors Split */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="brutal-card p-6 space-y-4 border-t-4 border-t-black dark:border-t-white">
          <h2 className="text-lg font-black uppercase text-black dark:text-white flex items-center gap-2 border-b-2 border-black dark:border-white pb-3">
            <CheckCircle2 className="w-5 h-5 text-brandRed" /> POSITIVE SCORE DRIVERS
          </h2>
          <div className="space-y-3">
            {profile?.positive_factors?.map((fact: any, idx: number) => (
              <div key={idx} className="p-3.5 bg-lightSurface2 dark:bg-darkSurface2 border border-black dark:border-white space-y-1">
                <div className="flex items-center justify-between text-xs font-black">
                  <span className="text-black dark:text-white uppercase">{fact.title}</span>
                  <span className="text-brandRed font-black">{fact.impact}</span>
                </div>
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">{fact.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="brutal-card p-6 space-y-4 border-t-4 border-t-brandRed">
          <h2 className="text-lg font-black uppercase text-black dark:text-white flex items-center gap-2 border-b-2 border-black dark:border-white pb-3">
            <AlertTriangle className="w-5 h-5 text-brandRed" /> WATCH FACTORS & RISK SIGNALS
          </h2>
          <div className="space-y-3">
            {profile?.watch_factors?.map((fact: any, idx: number) => (
              <div key={idx} className="p-3.5 bg-lightSurface2 dark:bg-darkSurface2 border border-black dark:border-white space-y-1">
                <div className="flex items-center justify-between text-xs font-black">
                  <span className="text-black dark:text-white uppercase">{fact.title}</span>
                  <span className="text-brandRed font-black">{fact.impact}</span>
                </div>
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">{fact.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
