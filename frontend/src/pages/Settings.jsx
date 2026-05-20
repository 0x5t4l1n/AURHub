import { useState, useEffect } from 'react';
import api from '../api/client';
import { Database, Cpu, Heart, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Settings() {
  const [clearing, setClearing] = useState(false);
  const [health, setHealth] = useState(null);
  const [checking, setChecking] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => { checkHealth(); }, []);

  async function checkHealth() {
    setChecking(true);
    try { setHealth(await api.healthCheck()); }
    catch (e) { setHealth({ status: 'offline', error: e.message }); }
    finally { setChecking(false); }
  }

  async function clearCache() {
    setClearing(true); setMsg(null);
    try {
      await api.clearCache();
      setMsg({ ok: true, text: 'Cache cleared successfully' });
    } catch (e) { setMsg({ ok: false, text: e.message }); }
    finally { setClearing(false); }
  }

  return (
    <div className="animate-slide-up max-w-2xl">
      <div className="mb-8">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Configure ArchStore preferences</p>
      </div>

      {msg && (
        <div className="rounded-xl p-4 mb-6 flex items-center gap-3 text-sm font-medium"
             style={{
               background: msg.ok ? 'var(--green-muted)' : 'var(--red-muted)',
               color: msg.ok ? 'var(--green)' : 'var(--red)',
               border: `1px solid ${msg.ok ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
             }}>
          <CheckCircle2 size={16} />
          {msg.text}
        </div>
      )}

      <div className="flex flex-col gap-5">
        {/* AUR Helper */}
        <div className="card p-6">
          <h3 className="font-semibold text-sm mb-1 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Cpu size={16} style={{ color: 'var(--accent)' }} />
            AUR Helper
          </h3>
          <p className="text-xs mb-4" style={{ color: 'var(--text-tertiary)' }}>
            The helper used to build and install AUR packages.
          </p>
          <div className="flex gap-3">
            {['yay', 'paru'].map((t) => (
              <div key={t} className="flex-1 p-3 rounded-xl text-center text-sm font-semibold transition-all cursor-default"
                   style={{
                     background: t === 'yay' ? 'var(--accent-muted)' : 'var(--bg-tertiary)',
                     color: t === 'yay' ? 'var(--accent)' : 'var(--text-tertiary)',
                     border: `1px solid ${t === 'yay' ? 'rgba(2,132,199,0.2)' : 'var(--border-primary)'}`,
                   }}>
                {t}
                {t === 'yay' && <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: 'var(--green-muted)', color: 'var(--green)' }}>Active</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Cache */}
        <div className="card p-6">
          <h3 className="font-semibold text-sm mb-1 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Database size={16} style={{ color: 'var(--accent)' }} />
            Cache
          </h3>
          <p className="text-xs mb-4" style={{ color: 'var(--text-tertiary)' }}>
            Search results and metadata are cached locally for 15 minutes.
          </p>
          <button onClick={clearCache} disabled={clearing} className="btn btn-danger text-xs">
            {clearing ? 'Clearing...' : 'Clear Cache'}
          </button>
        </div>

        {/* Health */}
        <div className="card p-6">
          <h3 className="font-semibold text-sm mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <AlertCircle size={16} style={{ color: 'var(--accent)' }} />
            Backend Status
          </h3>
          <div className="flex items-center justify-between p-4 rounded-xl font-mono text-xs"
               style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
            <span style={{ color: 'var(--text-tertiary)' }}>FastAPI Server</span>
            {health ? (
              health.status === 'healthy' ? (
                <span className="flex items-center gap-2 font-semibold" style={{ color: 'var(--green)' }}>
                  <span className="w-2 h-2 rounded-full" style={{ background: 'var(--green)' }}></span> Online
                </span>
              ) : (
                <span className="flex items-center gap-2 font-semibold" style={{ color: 'var(--red)' }}>
                  <span className="w-2 h-2 rounded-full" style={{ background: 'var(--red)' }}></span> Offline
                </span>
              )
            ) : (
              <span style={{ color: 'var(--text-tertiary)' }}>{checking ? 'Checking...' : 'Unknown'}</span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-6 text-xs" style={{ color: 'var(--text-tertiary)' }}>
          <span className="flex items-center justify-center gap-1">
            Made with <Heart size={11} style={{ color: 'var(--red)' }} /> for Arch Linux
          </span>
          <span>ArchStore v1.0.0</span>
        </div>
      </div>
    </div>
  );
}
