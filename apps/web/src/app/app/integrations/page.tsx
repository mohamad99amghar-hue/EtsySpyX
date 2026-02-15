
'use client';
import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function IntegrationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [config, setConfig] = useState<any>({ 
    aiProvider: 'openai', 
    etsyClientId: '', 
    apiKey: '', 
    etsyClientSecret: '' 
  });
  const [status, setStatus] = useState<any>({ etsyConnected: false });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  // Handle OAuth Callback via URL
  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    
    if (code && state) {
      // Clear URL
      router.replace('/app/integrations');
      finishEtsyAuth(code, state);
    } else {
      loadData();
    }
  }, [searchParams]);

  const loadData = async () => {
    try {
      const res = await api.get('/integrations/me');
      setConfig((prev: any) => ({ ...prev, ...res.data, apiKey: '', etsyClientSecret: '' }));
      setStatus(res.data);
    } catch (e) {}
  };

  const finishEtsyAuth = async (code: string, state: string) => {
    setLoading(true);
    try {
      await api.post('/etsy/oauth/finish', { code, state });
      setMsg('Etsy connected successfully!');
      loadData();
    } catch (e) {
      setMsg('Failed to connect Etsy.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/integrations/save', config);
      setMsg('Settings saved.');
      loadData();
    } catch (e) {
      setMsg('Error saving settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectEtsy = async () => {
    try {
      const res = await api.get('/etsy/oauth/start');
      window.location.href = res.data.url;
    } catch (e) {
      alert('Please save Client ID first.');
    }
  };

  const handleDisconnectEtsy = async () => {
      await api.post('/etsy/disconnect');
      loadData();
  };

  return (
    <div className="max-w-3xl space-y-8">
      <h1 className="text-3xl font-bold">Integrations</h1>
      
      {msg && <div className="p-4 bg-blue-50 text-blue-700 rounded-xl">{msg}</div>}

      <div className="card space-y-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          AI Provider 
          <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-1 rounded-md">Required</span>
        </h2>
        <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-3 border p-4 rounded-xl cursor-pointer hover:bg-slate-50">
                <input 
                    type="radio" 
                    name="aiProvider" 
                    value="openai" 
                    checked={config.aiProvider === 'openai'} 
                    onChange={e => setConfig({...config, aiProvider: e.target.value})}
                />
                <span className="font-medium">OpenAI (GPT-3.5/4)</span>
            </label>
        </div>
        <div>
            <label className="block text-sm font-medium mb-1">API Key</label>
            <input 
                type="password" 
                placeholder={status.hasAiKey ? "••••••••••••••••" : "sk-..."}
                className="input-field"
                value={config.apiKey}
                onChange={e => setConfig({...config, apiKey: e.target.value})}
            />
            <p className="text-xs text-slate-500 mt-1">Stored with AES-256 encryption.</p>
        </div>
      </div>

      <div className="card space-y-6">
        <div className="flex justify-between items-start">
            <h2 className="text-xl font-bold">Etsy API</h2>
            {status.etsyConnected ? (
                <span className="flex items-center gap-1 text-green-600 font-medium text-sm">
                    <CheckCircle2 size={16} /> Connected
                </span>
            ) : (
                <span className="flex items-center gap-1 text-slate-400 font-medium text-sm">
                    <AlertCircle size={16} /> Not Connected
                </span>
            )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium mb-1">Keystring (Client ID)</label>
                <input 
                    type="text" 
                    className="input-field"
                    value={config.etsyClientId || ''}
                    onChange={e => setConfig({...config, etsyClientId: e.target.value})}
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Callback URL</label>
                <input 
                    type="text" 
                    className="input-field bg-slate-100 text-slate-500"
                    value=".../api/etsy/oauth/callback"
                    disabled
                />
            </div>
        </div>

        <div className="flex gap-4 pt-2">
            {!status.etsyConnected ? (
                <button type="button" onClick={handleConnectEtsy} className="btn-secondary text-orange-600 border-orange-200 hover:bg-orange-50">
                    Connect Etsy Shop
                </button>
            ) : (
                <button type="button" onClick={handleDisconnectEtsy} className="btn-secondary text-red-600 hover:bg-red-50">
                    Disconnect Shop
                </button>
            )}
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={loading} className="btn-primary">
            {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
