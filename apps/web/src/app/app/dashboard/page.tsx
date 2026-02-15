
'use client';
import { ArrowUpRight, Search, BarChart3 } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-500">
          Last updated: Just now
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card space-y-2">
          <p className="text-sm text-slate-500 font-medium">Daily Lookups</p>
          <p className="text-3xl font-bold">12 / 50</p>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-black h-full w-[24%]"></div>
          </div>
        </div>
        <div className="card space-y-2">
          <p className="text-sm text-slate-500 font-medium">Opportunities Found</p>
          <p className="text-3xl font-bold text-green-600">8</p>
          <p className="text-xs text-slate-400">High profit potential</p>
        </div>
        <div className="card space-y-2">
          <p className="text-sm text-slate-500 font-medium">Connected Shop</p>
          <p className="text-3xl font-bold truncate">MyEtsyStore</p>
          <p className="text-xs text-green-500 flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500"></div> Active
          </p>
        </div>
      </div>

      <div className="card min-h-[300px] flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center text-orange-500 mb-2">
          <Search size={32} />
        </div>
        <h3 className="text-xl font-bold">Start Your Research</h3>
        <p className="text-slate-500 max-w-sm">
          Enter a keyword to analyze competition, demand, and profit potential using our AI engine.
        </p>
        <button className="btn-primary">
          Open Keyword Explorer
        </button>
      </div>
    </div>
  );
}
