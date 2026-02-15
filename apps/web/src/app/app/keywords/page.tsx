
'use client';
import { useState } from 'react';
import api from '../../../lib/api';
import { Search, Loader2 } from 'lucide-react';

export default function KeywordPage() {
  const [keyword, setKeyword] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const analyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await api.post('/ai/run', {
        type: 'keyword',
        input: { keyword }
      });
      setResult(res.data);
    } catch (e: any) {
      alert(e.response?.data?.error || 'Analysis failed. Check Integration settings.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Keyword Explorer</h1>
        <p className="text-slate-500">Discover high-demand, low-competition tags.</p>
      </div>

      <div className="card max-w-2xl mx-auto p-2 flex gap-2">
        <input 
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="e.g. leather wallet"
          className="flex-1 px-4 py-2 outline-none bg-transparent"
        />
        <button onClick={analyze} disabled={loading} className="btn-primary flex items-center gap-2">
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
          Analyze
        </button>
      </div>

      {result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {result.data.kpis.map((kpi: any, i: number) => (
              <div key={i} className="card text-center">
                <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">{kpi.label}</p>
                <p className="text-3xl font-bold mt-2">{kpi.value}</p>
              </div>
            ))}
          </div>

          <div className="card">
            <h3 className="text-lg font-bold mb-4">Strategic Summary</h3>
            <p className="text-slate-600 leading-relaxed">{result.data.summary}</p>
          </div>

          <div className="card overflow-hidden">
             <h3 className="text-lg font-bold mb-4">Related Opportunities</h3>
             <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b">
                    <tr>
                        <th className="p-4 font-medium text-slate-500">Keyword</th>
                        <th className="p-4 font-medium text-slate-500">Score</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {result.data.tables[0].rows.map((row: any, i: number) => (
                        <tr key={i}>
                            <td className="p-4 font-medium">{row[0]}</td>
                            <td className="p-4 text-slate-500">{row[1]}</td>
                        </tr>
                    ))}
                </tbody>
             </table>
          </div>
        </div>
      )}
    </div>
  );
}
