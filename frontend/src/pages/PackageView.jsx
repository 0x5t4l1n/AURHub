import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  ArrowLeft, Globe, ExternalLink, Download, Trash2,
  ShieldCheck, ShieldAlert, Shield, User, Clock, Package, AlertTriangle
} from 'lucide-react';

export default function PackageView() {
  const { packageName } = useParams();
  const navigate = useNavigate();
  const [pkg, setPkg] = useState(null);
  const [scan, setScan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [acting, setActing] = useState(false);
  const [log, setLog] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => { load(); }, [packageName]);

  async function load() {
    setLoading(true); setError(null);
    try {
      const d = await api.getPackageInfo(packageName);
      setPkg(d);
      if (d.source === 'aur') doScan(d.name);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function doScan(name) {
    setScanning(true);
    try { setScan(await api.scanPackage(name)); }
    catch { /* silent */ }
    finally { setScanning(false); }
  }

  async function install() {
    setActing(true); setLog('Installing...\n'); setError(null);
    try {
      const r = await api.installPackage(pkg.name);
      if (r.success) { setLog(p => p + '\n✓ Installed!\n' + r.message); setPkg(await api.getPackageInfo(pkg.name)); }
      else setError('Installation failed: ' + r.message);
    } catch (e) { setError(e.message); }
    finally { setActing(false); }
  }

  async function remove() {
    if (!confirm(`Remove ${pkg.name}?`)) return;
    setActing(true); setLog('Removing...\n'); setError(null);
    try {
      const r = await api.removePackage(pkg.name);
      if (r.success) { setLog(p => p + '\n✓ Removed!\n' + r.message); setPkg(await api.getPackageInfo(pkg.name)); }
      else setError('Removal failed: ' + r.message);
    } catch (e) { setError(e.message); }
    finally { setActing(false); }
  }

  if (loading) return <LoadingSpinner text="Loading package details..." />;

  if (error && !pkg) {
    return (
      <div className="animate-slide-up">
        <button onClick={() => navigate(-1)} className="btn btn-secondary mb-6"><ArrowLeft size={15} /> Back</button>
        <div className="rounded-xl p-6 text-sm" style={{ background: 'var(--red-muted)', color: 'var(--red)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <p className="font-semibold mb-1">Package not found</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const riskColor = !scan?.scanned ? 'var(--text-tertiary)'
    : scan.risk_score >= 70 ? 'var(--red)'
    : scan.risk_score >= 40 ? 'var(--amber)'
    : 'var(--green)';

  return (
    <div className="animate-slide-up max-w-4xl">
      <button onClick={() => navigate(-1)} className="btn btn-secondary mb-6"><ArrowLeft size={15} /> Back</button>

      {error && (
        <div className="rounded-xl p-4 mb-6 text-sm" style={{ background: 'var(--red-muted)', color: 'var(--red)', border: '1px solid rgba(239,68,68,0.2)' }}>
          {error}
        </div>
      )}

      {acting && (
        <div className="card p-5 mb-6" style={{ borderColor: 'rgba(2,132,199,0.3)' }}>
          <div className="flex items-center gap-2 mb-3 text-sm font-semibold" style={{ color: 'var(--accent)' }}>
            <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }}></div>
            Working...
          </div>
          <pre className="p-3 rounded-lg font-mono text-xs max-h-48 overflow-auto whitespace-pre-wrap"
               style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-primary)', color: 'var(--text-secondary)' }}>
            {log}
          </pre>
        </div>
      )}

      {/* ═══ Main Info Card ═══ */}
      <div className="card p-6 md:p-8 mb-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <h1 className="text-2xl md:text-3xl font-extrabold" style={{ letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
                {pkg.name}
              </h1>
              <span className={`badge ${pkg.source === 'aur' ? 'badge-aur' : 'badge-pacman'}`}>
                {pkg.source === 'aur' ? 'AUR' : (pkg.repository || 'pacman')}
              </span>
              {pkg.installed && <span className="badge badge-installed">Installed</span>}
              {pkg.out_of_date && (
                <span className="badge" style={{ background: 'var(--amber-muted)', color: 'var(--amber)' }}>
                  <AlertTriangle size={11} className="mr-1" /> Out of Date
                </span>
              )}
            </div>

            <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
              {pkg.description || 'No description available.'}
            </p>

            {/* Meta grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <MetaBox label="Version" value={pkg.version} mono />
              {pkg.source === 'aur' ? (
                <>
                  <MetaBox label="Votes" value={pkg.votes} />
                  <MetaBox label="Popularity" value={pkg.popularity?.toFixed(2) || '0.00'} />
                  <MetaBox label="Status" value={pkg.out_of_date ? 'Out of Date' : 'Current'}
                           color={pkg.out_of_date ? 'var(--amber)' : 'var(--green)'} />
                </>
              ) : (
                <>
                  <MetaBox label="Repository" value={pkg.repository || 'pacman'} />
                  <MetaBox label="State" value={pkg.installed ? 'Installed' : 'Available'} span={2} />
                </>
              )}
            </div>
          </div>

          {/* Right — Actions */}
          <div className="flex flex-col gap-3 md:w-52 shrink-0">
            {pkg.installed ? (
              <button onClick={remove} disabled={acting} className="btn btn-danger w-full py-3">
                <Trash2 size={15} /> Uninstall
              </button>
            ) : (
              <button onClick={install} disabled={acting} className="btn btn-primary w-full py-3">
                <Download size={15} /> Install
              </button>
            )}
            {pkg.url && (
              <a href={pkg.url} target="_blank" rel="noopener noreferrer"
                 className="btn btn-secondary w-full py-3 no-underline text-center">
                <Globe size={15} /> Website <ExternalLink size={11} />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ═══ Security Scan (AUR only) ═══ */}
      {pkg.source === 'aur' && (
        <div className="card p-6 mb-6">
          <h2 className="font-bold text-sm flex items-center gap-2 mb-5 pb-3"
              style={{ borderBottom: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}>
            <Shield size={17} style={{ color: 'var(--accent)' }} />
            Security Scan
          </h2>

          {scanning ? (
            <LoadingSpinner size="sm" text="Scanning PKGBUILD..." />
          ) : scan?.scanned ? (
            <div className="flex flex-col gap-4">
              {/* Score bar */}
              <div className="flex items-center justify-between p-4 rounded-xl"
                   style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
                <div className="flex items-center gap-3">
                  {scan.risk_score >= 70 ? <ShieldAlert size={22} style={{ color: riskColor }} />
                   : scan.risk_score >= 40 ? <ShieldAlert size={22} style={{ color: riskColor }} />
                   : <ShieldCheck size={22} style={{ color: riskColor }} />}
                  <div>
                    <p className="font-semibold text-sm capitalize" style={{ color: 'var(--text-primary)' }}>
                      {scan.risk_level}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>PKGBUILD analysis</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-extrabold" style={{ color: riskColor }}>{scan.risk_score}</span>
                  <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>/100</span>
                </div>
              </div>

              {/* Findings */}
              {scan.findings.filter(f => f.severity !== 'info').length > 0 ? (
                <div className="flex flex-col gap-2">
                  {scan.findings.filter(f => f.severity !== 'info').map((f, i) => (
                    <div key={i} className="p-3 rounded-xl text-xs flex flex-col gap-1"
                         style={{
                           background: f.severity === 'critical' ? 'var(--red-muted)' : 'var(--amber-muted)',
                           border: `1px solid ${f.severity === 'critical' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)'}`,
                           color: f.severity === 'critical' ? 'var(--red)' : 'var(--amber)',
                         }}>
                      <div className="flex justify-between">
                        <span className="font-bold uppercase">{f.severity}</span>
                        {f.line_number > 0 && <span className="font-mono opacity-70">L{f.line_number}</span>}
                      </div>
                      <p style={{ color: 'var(--text-primary)' }}>{f.description}</p>
                      {f.line_content && (
                        <pre className="p-2 rounded-lg font-mono mt-1 overflow-x-auto"
                             style={{ background: 'var(--bg-primary)', color: 'var(--text-tertiary)', fontSize: '0.65rem' }}>
                          {f.line_content}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl text-sm text-center"
                     style={{ background: 'var(--green-muted)', color: 'var(--green)', border: '1px solid rgba(34,197,94,0.15)' }}>
                  No security issues detected. Safe to install.
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-center py-4" style={{ color: 'var(--text-tertiary)' }}>
              Scan not available for this package.
            </p>
          )}
        </div>
      )}

      {/* ═══ Metadata ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="card p-6">
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2 pb-3"
              style={{ borderBottom: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}>
            <User size={15} /> Metadata
          </h3>
          <div className="flex flex-col gap-3 text-xs">
            {pkg.maintainer && <MetaRow label="Maintainer" value={pkg.maintainer} />}
            {pkg.last_modified > 0 && <MetaRow label="Modified" value={new Date(pkg.last_modified * 1000).toLocaleDateString()} />}
            {pkg.first_submitted > 0 && <MetaRow label="Submitted" value={new Date(pkg.first_submitted * 1000).toLocaleDateString()} />}
            {pkg.package_base && <MetaRow label="Base" value={pkg.package_base} />}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2 pb-3"
              style={{ borderBottom: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}>
            <Package size={15} /> Dependencies
          </h3>
          <div className="p-4 rounded-xl text-xs flex items-start gap-3"
               style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
            <Clock size={14} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 1 }} />
            <span style={{ color: 'var(--text-secondary)' }}>
              Dependencies are automatically resolved by pacman/yay during installation.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Helper components ── */
function MetaBox({ label, value, mono, color, span }) {
  return (
    <div className={`p-3 rounded-xl ${span === 2 ? 'col-span-2' : ''}`}
         style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
      <p className="text-[10px] uppercase font-bold tracking-wide mb-0.5" style={{ color: 'var(--text-tertiary)' }}>{label}</p>
      <p className={`text-sm font-semibold truncate ${mono ? 'font-mono' : ''}`}
         style={{ color: color || 'var(--text-primary)' }}>{value}</p>
    </div>
  );
}

function MetaRow({ label, value }) {
  return (
    <div className="flex justify-between items-center">
      <span style={{ color: 'var(--text-tertiary)' }}>{label}</span>
      <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{value}</span>
    </div>
  );
}
