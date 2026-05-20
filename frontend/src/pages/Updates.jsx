import { useState, useEffect } from 'react';
import api from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import { RefreshCw, ArrowUpCircle, Info, CheckCircle2, ArrowRight } from 'lucide-react';

export default function Updates() {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [log, setLog] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => { check(); }, []);

  async function check() {
    setLoading(true); setError(null);
    try { const d = await api.checkUpdates(); setUpdates(d.results || []); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function handleUpdate() {
    if (!confirm('Run a full system upgrade (yay -Syu)?')) return;
    setUpdating(true); setError(null);
    setLog('Starting system upgrade...\n');
    try {
      const r = await api.applyUpdates();
      if (r.success) { setLog(p => p + '\n✓ Upgrade complete!\n' + r.message); setUpdates([]); }
      else setError('Upgrade failed: ' + r.message);
    } catch (e) { setError(e.message); }
    finally { setUpdating(false); }
  }

  return (
    <div className="animate-slide-up flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="page-title">System Updates</h1>
          <p className="page-subtitle">Keep your system and AUR packages current</p>
        </div>
        <div className="flex gap-2">
          <button onClick={check} disabled={loading || updating} className="btn btn-secondary text-xs">
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Check
          </button>
          {updates.length > 0 && (
            <button onClick={handleUpdate} disabled={updating} className="btn btn-primary text-xs">
              <ArrowUpCircle size={12} /> Update All
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-lg p-3 text-xs font-medium"
             style={{ background: 'var(--red-muted)', color: 'var(--red)', border: '1px solid rgba(248,113,113,0.15)' }}>
          {error}
        </div>
      )}

      {/* Upgrade Log */}
      {updating && (
        <div className="card p-4" style={{ borderColor: 'var(--border-glow)' }}>
          <div className="flex items-center gap-2 mb-2 text-xs font-semibold" style={{ color: 'var(--accent)' }}>
            <RefreshCw size={12} className="animate-spin" /> Upgrading...
          </div>
          <pre className="p-3 rounded-md font-mono text-[11px] overflow-x-auto max-h-48 whitespace-pre-wrap"
               style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-primary)', color: 'var(--text-secondary)' }}>
            {log}
          </pre>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <LoadingSpinner text="Checking for updates..." />
      ) : updates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14" style={{ color: 'var(--text-tertiary)' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
               style={{ background: 'var(--green-muted)', border: '1px solid rgba(52,211,153,0.15)' }}>
            <CheckCircle2 size={18} style={{ color: 'var(--green)' }} />
          </div>
          <p className="text-sm font-medium mb-0.5" style={{ color: 'var(--text-secondary)' }}>All up to date</p>
          <p className="text-xs">No updates available right now</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {/* Info banner */}
          <div className="rounded-lg p-3 flex items-center gap-3 text-xs"
               style={{ background: 'var(--accent-muted)', border: '1px solid var(--border-glow)' }}>
            <Info size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
            <div>
              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                {updates.length} update{updates.length !== 1 ? 's' : ''} available
              </span>
              <span className="ml-2" style={{ color: 'var(--text-tertiary)' }}>
                Root privileges required.
              </span>
            </div>
          </div>

          {/* Update list */}
          <div className="card overflow-hidden">
            {updates.map((u, i) => (
              <div key={`${u.source}-${u.name}`}
                   className="update-row"
                   style={{ borderBottom: i < updates.length - 1 ? '1px solid var(--border-primary)' : 'none' }}>
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-semibold text-xs truncate" style={{ color: 'var(--text-primary)' }}>{u.name}</span>
                  <span className={`badge ${u.source === 'aur' ? 'badge-aur' : 'badge-pacman'}`}>
                    {u.source === 'aur' ? 'AUR' : 'pacman'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-mono shrink-0" style={{ color: 'var(--text-tertiary)' }}>
                  <span>{u.current_version}</span>
                  <ArrowRight size={10} style={{ color: 'var(--text-tertiary)' }} />
                  <span style={{ color: 'var(--green)', fontWeight: 600 }}>{u.new_version}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
