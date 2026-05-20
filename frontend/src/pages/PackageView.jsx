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
      <div className="animate-slide-up max-w-2xl">
        <button onClick={() => navigate(-1)} className="btn btn-secondary mb-4"><ArrowLeft size={13} /> Back</button>
        <div className="rounded-lg p-4 text-xs" style={{ background: 'var(--red-muted)', color: 'var(--red)', border: '1px solid rgba(248,113,113,0.15)' }}>
          <p className="font-semibold mb-0.5">Package not found</p>
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
    <div className="animate-slide-up max-w-3xl flex flex-col gap-4">
      <div>
        <button onClick={() => navigate(-1)} className="btn btn-secondary mb-3"><ArrowLeft size={13} /> Back</button>
      </div>

      {error && (
        <div className="rounded-lg p-3 text-xs" style={{ background: 'var(--red-muted)', color: 'var(--red)', border: '1px solid rgba(248,113,113,0.15)' }}>
          {error}
        </div>
      )}

      {acting && (
        <div className="card p-4" style={{ borderColor: 'var(--border-glow)' }}>
          <div className="flex items-center gap-2 mb-2 text-xs font-semibold" style={{ color: 'var(--accent)' }}>
            <div className="spinner" style={{ width: 12, height: 12, borderWidth: 1.5 }}></div>
            Working...
          </div>
          <pre className="p-3 rounded font-mono text-[10px] max-h-36 overflow-auto whitespace-pre-wrap"
               style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-primary)', color: 'var(--text-secondary)' }}>
            {log}
          </pre>
        </div>
      )}

      {/* Main Info Card */}
      <div className="card p-5">
        <div className="flex flex-col md:flex-row gap-5">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h1 className="text-xl font-bold leading-tight" style={{ letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                {pkg.name}
              </h1>
              <span className={`badge ${pkg.source === 'aur' ? 'badge-aur' : 'badge-pacman'}`}>
                {pkg.source === 'aur' ? 'AUR' : (pkg.repository || 'pacman')}
              </span>
              {pkg.installed && <span className="badge badge-installed">Installed</span>}
              {pkg.out_of_date && (
                <span className="badge" style={{ background: 'var(--amber-muted)', color: 'var(--amber)' }}>
                  <AlertTriangle size={10} className="mr-1" /> Out of Date
                </span>
              )}
            </div>

            <p className="text-xs leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
              {pkg.description || 'No description available.'}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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

          {/* Action column */}
          <div className="flex flex-col gap-2 md:w-44 shrink-0 justify-center">
            {pkg.installed ? (
              <button onClick={remove} disabled={acting} className="btn btn-danger w-full py-2">
                <Trash2 size={13} /> Uninstall
              </button>
            ) : (
              <button onClick={install} disabled={acting} className="btn btn-primary w-full py-2">
                <Download size={13} /> Install
              </button>
            )}
            {pkg.url && (
              <a href={pkg.url} target="_blank" rel="noopener noreferrer"
                 className="btn btn-secondary w-full py-2 no-underline text-center justify-center flex items-center gap-1.5">
                <Globe size={13} /> Website <ExternalLink size={10} />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Security Analysis */}
      {pkg.source === 'aur' && (
        <div className="card p-4">
          <h3 className="font-bold text-xs flex items-center gap-1.5 mb-3 pb-2"
              style={{ borderBottom: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}>
            <Shield size={14} style={{ color: 'var(--accent)' }} />
            Security Scan (AUR PKGBUILD)
          </h3>

          {scanning ? (
            <LoadingSpinner size="sm" text="Scanning PKGBUILD..." />
          ) : scan?.scanned ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between p-3 rounded-lg"
                   style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs capitalize" style={{ color: riskColor }}>
                    {scan.risk_level} Risk
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold" style={{ color: riskColor }}>{scan.risk_score}</span>
                  <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>/100</span>
                </div>
              </div>

              {scan.findings.filter(f => f.severity !== 'info').length > 0 ? (
                <div className="flex flex-col gap-1.5">
                  {scan.findings.filter(f => f.severity !== 'info').map((f, i) => (
                    <div key={i} className="p-2.5 rounded-lg text-[11px] flex flex-col gap-1"
                         style={{
                           background: f.severity === 'critical' ? 'var(--red-muted)' : 'var(--amber-muted)',
                           border: `1px solid ${f.severity === 'critical' ? 'rgba(248,113,113,0.15)' : 'rgba(251,191,36,0.15)'}`,
                           color: f.severity === 'critical' ? 'var(--red)' : 'var(--amber)',
                         }}>
                      <div className="flex justify-between font-bold uppercase text-[9px] tracking-wide">
                        <span>{f.severity}</span>
                        {f.line_number > 0 && <span className="opacity-70">Line {f.line_number}</span>}
                      </div>
                      <p style={{ color: 'var(--text-primary)' }}>{f.description}</p>
                      {f.line_content && (
                        <pre className="p-1.5 rounded font-mono text-[9px] mt-1 overflow-x-auto"
                             style={{ background: 'var(--bg-primary)', color: 'var(--text-tertiary)' }}>
                          {f.line_content}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 rounded-lg text-xs text-center font-medium"
                     style={{ background: 'var(--green-muted)', color: 'var(--green)', border: '1px solid rgba(52,211,153,0.15)' }}>
                  No security issues found in static PKGBUILD check.
                </div>
              )}
            </div>
          ) : (
            <p className="text-[11px] text-center py-2" style={{ color: 'var(--text-tertiary)' }}>
              Scan not available.
            </p>
          )}
        </div>
      )}

      {/* Metadata Detail Row Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-4">
          <h3 className="font-bold text-xs mb-3 flex items-center gap-1.5 pb-2"
              style={{ borderBottom: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}>
            <User size={13} /> Package Metadata
          </h3>
          <div className="flex flex-col gap-2 text-[11px]">
            {pkg.maintainer && <MetaRow label="Maintainer" value={pkg.maintainer} />}
            {pkg.last_modified > 0 && <MetaRow label="Last Modified" value={new Date(pkg.last_modified * 1000).toLocaleDateString()} />}
            {pkg.first_submitted > 0 && <MetaRow label="First Submitted" value={new Date(pkg.first_submitted * 1000).toLocaleDateString()} />}
            {pkg.package_base && <MetaRow label="Package Base" value={pkg.package_base} />}
          </div>
        </div>

        <div className="card p-4">
          <h3 className="font-bold text-xs mb-3 flex items-center gap-1.5 pb-2"
              style={{ borderBottom: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}>
            <Package size={13} /> Dependency Handling
          </h3>
          <div className="p-3 rounded-lg text-[11px] flex items-start gap-2"
               style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
            <Clock size={13} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 1 }} />
            <span style={{ color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Dependencies are automatically analyzed, resolved, and processed by standard package management operations during final deployment.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetaBox({ label, value, mono, color, span }) {
  return (
    <div className={`p-2 rounded-lg ${span === 2 ? 'col-span-2' : ''}`}
         style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
      <p className="text-[9px] uppercase font-bold tracking-wide mb-0.5" style={{ color: 'var(--text-tertiary)' }}>{label}</p>
      <p className={`text-xs font-semibold truncate ${mono ? 'font-mono' : ''}`}
         style={{ color: color || 'var(--text-primary)' }}>{value || '—'}</p>
    </div>
  );
}

function MetaRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-0.5">
      <span style={{ color: 'var(--text-tertiary)' }}>{label}</span>
      <span className="font-semibold text-right" style={{ color: 'var(--text-primary)' }}>{value}</span>
    </div>
  );
}
