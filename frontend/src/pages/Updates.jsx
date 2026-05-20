import { useState, useEffect } from 'react';
import api from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import { RefreshCw, ArrowUpCircle, Info, CheckCircle2 } from 'lucide-react';

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
    <div className="animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="page-title">System Updates</h1>
          <p className="page-subtitle">Keep your system and AUR packages current</p>
        </div>
        <div className="flex gap-3">
          <button onClick={check} disabled={loading || updating} className="btn btn-secondary">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Check
          </button>
          {updates.length > 0 && (
            <button onClick={handleUpdate} disabled={updating} className="btn btn-primary">
              <ArrowUpCircle size={15} /> Update All
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-xl p-4 mb-6 text-sm font-medium"
             style={{ background: 'var(--red-muted)', color: 'var(--red)', border: '1px solid rgba(239,68,68,0.2)' }}>
          {error}
        </div>
      )}

      {updating && (
        <div className="card p-6 mb-8" style={{ borderColor: 'rgba(2,132,199,0.3)' }}>
          <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm">
            <RefreshCw size={16} className="animate-spin" style={{ color: 'var(--accent)' }} />
            Upgrading...
          </h3>
          <pre className="p-4 rounded-lg font-mono text-xs overflow-x-auto max-h-64 whitespace-pre-wrap"
               style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-primary)', color: 'var(--text-secondary)' }}>
            {log}
          </pre>
        </div>
      )}

      {loading ? (
        <LoadingSpinner text="Checking for updates..." />
      ) : updates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24" style={{ color: 'var(--text-tertiary)' }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
               style={{ background: 'var(--green-muted)', border: '1px solid rgba(34,197,94,0.2)' }}>
            <CheckCircle2 size={28} style={{ color: 'var(--green)' }} />
          </div>
          <p className="text-base font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>All up to date</p>
          <p className="text-sm">No updates available right now</p>
        </div>
      ) : (
        <div>
          <div className="rounded-xl p-4 mb-6 flex items-start gap-3 text-sm"
               style={{ background: 'var(--accent-muted)', border: '1px solid rgba(2,132,199,0.2)' }}>
            <Info size={18} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 2 }} />
            <div>
              <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{updates.length} update{updates.length !== 1 ? 's' : ''} available</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>System administrator privileges required to install.</p>
            </div>
          </div>

          <div className="card overflow-hidden">
            {updates.map((u, i) => (
              <div key={`${u.source}-${u.name}`}
                   className="update-row"
                   style={{
                     borderBottom: i < updates.length - 1 ? '1px solid var(--border-primary)' : 'none',
                   }}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{u.name}</span>
                    <span className={`badge ${u.source === 'aur' ? 'badge-aur' : 'badge-pacman'}`}>
                      {u.source === 'aur' ? 'AUR' : 'pacman'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>
                    <span>{u.current_version}</span>
                    <span>→</span>
                    <span style={{ color: 'var(--green)', fontWeight: 600 }}>{u.new_version}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
