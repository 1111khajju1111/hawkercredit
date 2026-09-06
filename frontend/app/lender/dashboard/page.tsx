'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useRequireAuth } from '@/lib/auth';
import { ShieldCheck, Cpu, Users, DollarSign, TrendingUp, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export default function LenderDashboard() {
  const { loading: authLoading } = useRequireAuth(['LENDER', 'ADMIN']);
  const [vendors, setVendors] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    if (authLoading) return;
    async function load() {
      try {
        const s = await api.getLenderSummary();
        setSummary(s);
        setVendors(s.vendors || []);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, [authLoading]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-card p-6 border-l-4 border-l-accent">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-accent" /> Institutional Lender Portfolio Intelligence
          </h1>
          <p className="text-xs text-gray-400">Quantum-assisted constrained portfolio allocation & decision support for micro-lending</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/lender/portfolio/optimizer" className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-accent via-primary to-cyanAccent text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-accent/20">
            <Sparkles className="w-4 h-4" /> Run Quantum Optimizer
          </Link>
          <Link href="/lender/benchmark" className="px-4 py-2.5 rounded-xl bg-surfaceLight text-white font-semibold text-xs border border-border">
            Classical vs Quantum Benchmark
          </Link>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 space-y-1">
          <div className="text-xs font-semibold text-gray-400">Total Vendor Pool</div>
          <div className="text-3xl font-extrabold text-white">{summary?.total_vendors ?? vendors.length} Vendors</div>
          <p className="text-[11px] text-gray-400">Active daily business diaries</p>
        </div>

        <div className="glass-card p-5 space-y-1">
          <div className="text-xs font-semibold text-gray-400">Available Capital Budget</div>
          <div className="text-3xl font-extrabold text-cyanAccent">₹10,00,000</div>
          <p className="text-[11px] text-gray-400">Configured portfolio pool</p>
        </div>

        <div className="glass-card p-5 space-y-1">
          <div className="text-xs font-semibold text-gray-400">Avg Credit Intelligence Score</div>
          <div className="text-3xl font-extrabold text-emeraldAccent">
            {summary?.avg_credit_score != null ? Math.round(summary.avg_credit_score) : 'N/A'}
          </div>
          <p className="text-[11px] text-gray-400">Average persisted credit score</p>
        </div>

        <div className="glass-card p-5 space-y-1">
          <div className="text-xs font-semibold text-gray-400">Pending Human Reviews</div>
          <div className="text-3xl font-extrabold text-warning">
            {summary?.pending_human_reviews ?? 'N/A'}
          </div>
          <p className="text-[11px] text-gray-400">Requires human decision</p>
        </div>
      </div>

      {/* Candidate Vendors & Quick Optimization Preview */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Eligible Candidate Vendors</h2>
          <Link href="/lender/vendors" className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
            Browse All Vendors <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {vendors.slice(0, 6).map((v, i) => (
            <div key={v.vendor_id || i} className="p-4 rounded-xl bg-surfaceLight/60 border border-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">{v.name}</span>
                <span className="text-xs font-bold text-emeraldAccent bg-emeraldAccent/10 px-2 py-0.5 rounded-full border border-emeraldAccent/20">
                  {v.score != null ? `Score: ${v.score}` : 'Score: N/A'}
                </span>
              </div>
              <p className="text-xs text-gray-400">{v.business_type} • {v.location}</p>
              <div className="flex items-center justify-between pt-2 text-xs border-t border-border/40">
                <span className="text-gray-400">Requested Loan:</span>
                <strong className="text-cyanAccent">
                  {v.requested_loan != null
                    ? `₹${Number(v.requested_loan).toLocaleString('en-IN')}`
                    : 'N/A'}
                </strong>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
