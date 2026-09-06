'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useRequireAuth } from '@/lib/auth';
import { Search, Filter, ShieldCheck, ArrowRight } from 'lucide-react';

export default function VendorDiscoveryPage() {
  const { loading: authLoading } = useRequireAuth(['LENDER', 'ADMIN']);
  const [vendors, setVendors] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (authLoading) return;
    async function load() {
      const data = await api.getVendors();
      setVendors(data);
    }
    load();
  }, [authLoading]);

  const filtered = vendors.filter(v => v.name.toLowerCase().includes(search.toLowerCase()) || v.business_type.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-card p-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Search className="w-5 h-5 text-primary" /> Vendor Discovery & Portfolio Search
          </h1>
          <p className="text-xs text-gray-400">Search and filter street vendors by alternative score, business type, location, and risk category</p>
        </div>

        <div className="w-full md:w-72 relative">
          <input
            type="text"
            placeholder="Search vendor name or business..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-2.5 pl-9 rounded-xl bg-surfaceLight border border-border text-xs text-white focus:outline-none focus:border-primary"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filtered.map((v) => (
          <div key={v.vendor_id} className="glass-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white">{v.name}</span>
              <span className="text-xs font-bold text-emeraldAccent bg-emeraldAccent/10 px-2 py-0.5 rounded-full border border-emeraldAccent/20">
                Score: N/A
              </span>
            </div>
            <p className="text-xs text-gray-400">{v.business_type} • {v.location}</p>

            <div className="space-y-1 pt-2 border-t border-border/60 text-xs">
              <div className="flex justify-between text-gray-400"><span>Repayment Prob:</span> <strong className="text-white">N/A</strong></div>
              <div className="flex justify-between text-gray-400"><span>Data Quality:</span> <strong className="text-cyanAccent">N/A</strong></div>
              <div className="flex justify-between text-gray-400"><span>Requested Loan:</span> <strong className="text-primary">N/A</strong></div>
            </div>

            <Link href={`/vendor/credit-profile`} className="block text-center py-2 rounded-lg bg-surfaceLight hover:bg-surfaceLight/80 text-xs font-bold text-white transition-colors">
              View Explainable Profile
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
