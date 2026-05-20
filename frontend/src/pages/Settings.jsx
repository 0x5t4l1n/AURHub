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
    <div className="animate-slide-up max-w-xl">
      <div className="mb-5">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Configure ArchStore preferences</p>
      </div>

      {msg && (
        <div className="rounded-lg p-3 mb-4 flex items-center gap-2 text-xs font-medium"
             style={{
               background: msg.ok ? 'var(--green-muted)' : 'var(--red-muted)',
               color: msg.ok ? 'var(--green)' : 'var(--red)',
               border: `1px solid ${msg.ok ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)'}`,
             }}>
          <CheckCircle2 size={14} />
          {msg.text}
        </div>
      )}

      <div className="flex flex-col gap-4">
        {/* AUR Helper */}
        <div className="card p-4">
          <h3 className="font-semibold text-xs mb-1 flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
            <Cpu size={14} style={{ color: 'var(--accent)' }} />
            AUR Helper
          </h3>
          <p className="text-[11px] mb-3" style={{ color: 'var(--text-tertiary)' }}>
            The helper tool utilized to build and install AUR packages.
          </p>
          <div className="flex gap-2">
            {['yay', 'paru'].map((t) => (
              <div key={t} className="flex-1 p-2.5 rounded-lg text-center text-xs font-semibold transition-all cursor-default flex items-center justify-center gap-2"
                   style={{
                     background: t === 'yay' ? 'var(--accent-muted)' : 'var(--bg-tertiary)',
                     color: t === 'yay' ? 'var(--accent)' : 'var(--text-tertiary)',
                     border: `1px solid ${t === 'yay' ? 'rgba(56,189,248,0.2)' : 'var(--border-primary)'}`,
                   }}>
                {t}
                {t === 'yay' && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: 'var(--green-muted)', color: 'var(--green)' }}>Active</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Cache */}
        <div className="card p-4">
          <h3 className="font-semibold text-xs mb-1 flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
            <Database size={14} style={{ color: 'var(--accent)' }} />
            Cache
          </h3>
          <p className="text-[11px] mb-3" style={{ color: 'var(--text-tertiary)' }}>
            Search results and package metadata are cached locally to reduce API overhead.
          </p>
          <button onClick={clearCache} disabled={clearing} className="btn btn-danger text-xs px-3 py-1.5">
            {clearing ? 'Clearing...' : 'Clear Cache'}
          </button>
        </div>

        {/* Health */}
        <div className="card p-4">
          <h3 className="font-semibold text-xs mb-3 flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
            <AlertCircle size={14} style={{ color: 'var(--accent)' }} />
            Backend Status
          </h3>
          <div className="flex items-center justify-between p-3 rounded-lg font-mono text-[11px]"
               style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
            <span style={{ color: 'var(--text-tertiary)' }}>FastAPI Server</span>
            {health ? (
              health.status === 'healthy' ? (
                <span className="flex items-center gap-1.5 font-semibold" style={{ color: 'var(--green)' }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--green)' }}></span> Online
                </span>
              ) : (
                <span className="flex items-center gap-1.5 font-semibold" style={{ color: 'var(--red)' }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--red)' }}></span> Offline
                </span>
              )
            ) : (
              <span style={{ color: 'var(--text-tertiary)' }}>{checking ? 'Checking...' : 'Unknown'}</span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-4 text-[11px] flex flex-col items-center gap-0.5" style={{ color: 'var(--text-tertiary)' }}>
          <span className="flex items-center justify-center gap-1">
            Made with <Heart size={10} style={{ color: 'var(--red)', fill: 'var(--red)' }} /> for Arch Linux
          </span>
          <span>ArchStore v1.0.0</span>
        </div>
      </div>
    </div>
  );
}
