import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/client';
import PackageGrid from '../components/PackageGrid';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Filter, Search, Grid, List, CheckCircle, AlertTriangle, Star,
  Download, Globe, ExternalLink, Trash2, Shield, Package
} from 'lucide-react';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState('all');
  const [error, setError] = useState(null);
  const [layoutMode, setLayoutMode] = useState('grid');
  const [sortBy, setSortBy] = useState('relevance');
  const [filters, setFilters] = useState({ installed: false, outOfDate: false, hasVotes: false });

  // Selected package details for right preview panel
  const [selectedPkgName, setSelectedPkgName] = useState(null);
  const [pkgDetail, setPkgDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [actionLog, setActionLog] = useState('');
  const [acting, setActing] = useState(false);

  useEffect(() => {
    if (query.trim()) {
      performSearch(query, source);
    } else {
      setResults([]);
      setSelectedPkgName(null);
      setPkgDetail(null);
    }
  }, [query, source]);

  useEffect(() => {
    if (selectedPkgName) {
      loadDetails(selectedPkgName);
    } else {
      setPkgDetail(null);
      setScanResult(null);
    }
  }, [selectedPkgName]);

  async function performSearch(q, s) {
    setLoading(true);
    setError(null);
    try {
      const data = await api.searchPackages(q, s);
      const resList = data.results || [];
      setResults(resList);
      if (resList.length > 0) {
        setSelectedPkgName(resList[0].name);
      } else {
        setSelectedPkgName(null);
      }
    } catch (err) {
      setError(err.message);
      setResults([]);
      setSelectedPkgName(null);
    } finally {
      setLoading(false);
    }
  }

  async function loadDetails(name) {
    setDetailLoading(true);
    setScanResult(null);
    setActionLog('');
    try {
      const detail = await api.getPackageInfo(name);
      setPkgDetail(detail);
      if (detail.source === 'aur') {
        doScan(detail.name);
      }
    } catch {
      // silent fallback
    } finally {
      setDetailLoading(false);
    }
  }

  async function doScan(name) {
    setScanning(true);
    try {
      const scan = await api.scanPackage(name);
      setScanResult(scan);
    } catch {
      // silent fallback
    } finally {
      setScanning(false);
    }
  }

  async function handleInstall() {
    if (!pkgDetail) return;
    setActing(true);
    setActionLog('Retrieving database structures...\nInitializing builder pipeline...\n');
    try {
      const res = await api.installPackage(pkgDetail.name);
      if (res.success) {
        setActionLog(prev => prev + '\n✓ Build completed successfully!\n' + res.message);
        loadDetails(pkgDetail.name);
      } else {
        setError('Installation failed: ' + res.message);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setActing(false);
    }
  }

  async function handleUninstall() {
    if (!pkgDetail || !confirm(`Remove ${pkgDetail.name}?`)) return;
    setActing(true);
    setActionLog('Resolving package graph...\nRemoving target dependencies...\n');
    try {
      const res = await api.removePackage(pkgDetail.name);
      if (res.success) {
        setActionLog(prev => prev + '\n✓ Uninstallation complete!\n' + res.message);
        loadDetails(pkgDetail.name);
      } else {
        setError('Removal failed: ' + res.message);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setActing(false);
    }
  }

  const tabs = [
    { id: 'all', label: 'All Packages' },
    { id: 'pacman', label: 'Official' },
    { id: 'aur', label: 'AUR Repos' },
  ];

  const filteredResults = results
    .filter((pkg) => !filters.installed || pkg.installed)
    .filter((pkg) => !filters.outOfDate || pkg.out_of_date)
    .filter((pkg) => !filters.hasVotes || (pkg.votes || 0) > 0);

  const sortedResults = [...filteredResults].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'votes') return (b.votes || 0) - (a.votes || 0);
    if (sortBy === 'popularity') return (b.popularity || 0) - (a.popularity || 0);
    return 0;
  });

  return (
    <div className="animate-slide-up flex flex-col gap-6 w-full">
      {/* Search page sub-header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h1 className="page-title text-white">Advanced Search</h1>
          <p className="page-subtitle">
            {query ? <>Queried results for <strong style={{ color: 'var(--accent)' }}>&quot;{query}&quot;</strong></> : 'Query pacman databases and AUR repositories'}
          </p>
        </div>

        {query && (
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex p-1 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-primary)]">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSource(tab.id)}
                  className="px-4 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer"
                  style={{
                    background: source === tab.id ? 'var(--accent)' : 'transparent',
                    color: source === tab.id ? '#fff' : 'var(--text-secondary)',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: 'var(--text-tertiary)' }}>
              <Filter size={13} /> {sortedResults.length} results
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-xl p-4 text-xs font-semibold"
             style={{ background: 'var(--red-muted)', color: 'var(--red)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          {error}
        </div>
      )}

      {query ? (
        /* Triple Column Split Layout */
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start w-full">
          {/* Results Panel */}
          <div className="xl:col-span-8 flex flex-col gap-4 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <input type="checkbox" checked={filters.installed} onChange={() => setFilters((prev) => ({ ...prev, installed: !prev.installed }))} />
                  Installed
                </label>
                <label className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <input type="checkbox" checked={filters.outOfDate} onChange={() => setFilters((prev) => ({ ...prev, outOfDate: !prev.outOfDate }))} />
                  Out of date
                </label>
                <label className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <input type="checkbox" checked={filters.hasVotes} onChange={() => setFilters((prev) => ({ ...prev, hasVotes: !prev.hasVotes }))} />
                  Has votes
                </label>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Sort</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input !py-1.5 !px-2 text-xs"
                  style={{ width: 140 }}
                >
                  {['relevance', 'name', 'votes', 'popularity'].map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="pill">
                  <CheckCircle size={12} /> {results.filter(r => r.installed).length} installed
                </span>
                <span className="pill">
                  <AlertTriangle size={12} /> {results.filter(r => r.out_of_date).length} out of date
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="btn-ghost !p-2 rounded-lg"
                  style={{ color: layoutMode === 'grid' ? 'var(--accent)' : 'var(--text-tertiary)' }}
                  onClick={() => setLayoutMode('grid')}
                >
                  <Grid size={15} />
                </button>
                <button
                  className="btn-ghost !p-2 rounded-lg"
                  style={{ color: layoutMode === 'list' ? 'var(--accent)' : 'var(--text-tertiary)' }}
                  onClick={() => setLayoutMode('list')}
                >
                  <List size={15} />
                </button>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="card p-4 flex flex-col gap-2">
                    <div className="shimmer h-4 w-32"></div>
                    <div className="shimmer h-3 w-16 mb-2"></div>
                    <div className="shimmer h-3 w-full"></div>
                    <div className="shimmer h-3 w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : sortedResults.length === 0 ? (
              <div className="card p-12 text-center flex flex-col items-center justify-center gap-3">
                <Package size={36} className="text-slate-500" />
                <h3 className="font-bold text-base text-slate-200">No packages match the query</h3>
                <p className="text-xs text-slate-400">Refine the query or check for alternative repository scopes.</p>
              </div>
            ) : layoutMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sortedResults.map((pkg) => (
                  <div
                    key={`${pkg.source}-${pkg.name}`}
                    className={`card card-interactive p-4 flex flex-col justify-between min-h-[150px] ${selectedPkgName === pkg.name ? 'border-[var(--border-secondary)]' : ''}`}
                    onClick={() => setSelectedPkgName(pkg.name)}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="font-extrabold text-sm text-slate-100 truncate flex items-center gap-1.5">
                          {pkg.name}
                          {pkg.installed && <CheckCircle size={12} className="text-[var(--green)]" />}
                          {pkg.out_of_date && <AlertTriangle size={12} className="text-[var(--amber)]" />}
                        </span>
                        <span className={`badge ${pkg.source === 'aur' ? 'badge-aur' : 'badge-pacman'} text-[9px]`}>
                          {pkg.source === 'aur' ? 'AUR' : (pkg.repository || 'pacman')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 line-clamp-2 min-h-[2.6em] leading-relaxed">
                        {pkg.description || 'No description available.'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-[var(--border-primary)] text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                      <span className="font-mono text-slate-400 font-semibold">{pkg.version || '—'}</span>
                      {pkg.installed ? (
                        <span className="text-[var(--green)] font-bold">Installed</span>
                      ) : (
                        <span className="text-[var(--accent)] font-semibold flex items-center gap-1">
                          <Download size={11} /> Preview
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="data-table">
                <div className="table-head">
                  <span>Name</span>
                  <span>Version</span>
                  <span>Source</span>
                  <span>Description</span>
                  <span>Status</span>
                </div>
                {sortedResults.map((pkg) => (
                  <div
                    key={`${pkg.source}-${pkg.name}`}
                    className={`table-row ${selectedPkgName === pkg.name ? 'ring-1 ring-[var(--accent-glow)]' : ''}`}
                    onClick={() => setSelectedPkgName(pkg.name)}
                  >
                    <span className="font-semibold text-slate-100 truncate">{pkg.name}</span>
                    <span className="font-mono text-xs text-slate-400 truncate">{pkg.version || '—'}</span>
                    <span className={`badge ${pkg.source === 'aur' ? 'badge-aur' : 'badge-pacman'} text-[9px] w-fit`}>
                      {pkg.source === 'aur' ? 'AUR' : (pkg.repository || 'pacman')}
                    </span>
                    <span className="text-xs text-slate-400 truncate">{pkg.description || 'No description available.'}</span>
                    <span className="text-xs font-semibold" style={{ color: pkg.installed ? 'var(--green)' : 'var(--text-tertiary)' }}>
                      {pkg.installed ? 'Installed' : 'Available'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Panel: detailed specification drawer */}
          <div className="xl:col-span-4 card p-5 flex flex-col gap-5 sticky top-24 max-h-[calc(100vh-130px)] overflow-y-auto min-w-0">
            {detailLoading ? (
              <LoadingSpinner text="Fetching full package schema..." />
            ) : pkgDetail ? (
              <div className="flex flex-col gap-4">
                
                {/* Header info */}
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-base font-extrabold text-white">{pkgDetail.name}</span>
                    <span className={`badge ${pkgDetail.source === 'aur' ? 'badge-aur' : 'badge-pacman'}`}>
                      {pkgDetail.source === 'aur' ? 'AUR' : 'pacman'}
                    </span>
                    {pkgDetail.installed && <span className="badge badge-installed">Active</span>}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {pkgDetail.description || 'No description specs available for this system library.'}
                  </p>
                </div>

                {/* Console build output */}
                {acting && (
                  <div className="bg-slate-950 border border-[var(--border-glow)] rounded-xl p-3">
                    <span className="text-[10px] font-bold text-slate-400 block mb-1">Process output console</span>
                    <pre className="font-mono text-[9px] text-[var(--accent)] whitespace-pre-wrap max-h-32 overflow-y-auto leading-normal">
                      {actionLog}
                    </pre>
                  </div>
                )}

                {/* Actions Row */}
                <div className="grid grid-cols-2 gap-3 pb-3 border-b border-[var(--border-primary)]">
                  {pkgDetail.installed ? (
                    <button onClick={handleUninstall} disabled={acting} className="btn btn-danger py-2">
                      <Trash2 size={13} /> Remove pkg
                    </button>
                  ) : (
                    <button onClick={handleInstall} disabled={acting} className="btn btn-primary py-2">
                      <Download size={13} /> Install package
                    </button>
                  )}

                  {pkgDetail.url ? (
                    <a href={pkgDetail.url} target="_blank" rel="noopener noreferrer"
                       className="btn btn-secondary py-2 no-underline text-center justify-center flex items-center gap-1.5">
                      <Globe size={13} /> Website <ExternalLink size={10} />
                    </a>
                  ) : (
                    <button className="btn btn-secondary opacity-50 cursor-not-allowed">No specs URL</button>
                  )}
                </div>

                {/* Static scan widget (AUR only) */}
                {pkgDetail.source === 'aur' && (
                  <div className="bg-slate-900/40 border border-[var(--border-primary)] rounded-xl p-3.5 flex flex-col gap-2.5">
                    <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                      <Shield size={13} style={{ color: 'var(--accent)' }} /> PKGBUILD Security Scan
                    </h4>
                    {scanning ? (
                      <span className="text-[10px] text-slate-400 animate-pulse">Running static scan routines...</span>
                    ) : scanResult ? (
                      <div className="flex flex-col gap-2 text-[11px]">
                        <div className="flex justify-between items-center bg-slate-950 p-2 rounded border border-[var(--border-primary)]">
                          <span className="font-bold text-slate-300">Risk Assessment:</span>
                          <span className="font-extrabold"
                                style={{
                                  color: scanResult.risk_score >= 70 ? 'var(--red)'
                                    : scanResult.risk_score >= 40 ? 'var(--amber)'
                                    : 'var(--green)'
                                }}>
                            {scanResult.risk_score} / 100 ({scanResult.risk_level})
                          </span>
                        </div>
                        {scanResult.findings.length > 0 ? (
                          <div className="text-[10px] text-red-400 bg-red-950/20 border border-red-500/10 p-2 rounded">
                            Static analyzer detected script mutations or potentially unsafe downloads. Verify manual details in PKGBUILD.
                          </div>
                        ) : (
                          <div className="text-[10px] text-green-400 bg-green-950/20 border border-green-500/10 p-2 rounded">
                            Verified PKGBUILD check completed. No suspicious mutations found.
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400">Scan details not loaded.</span>
                    )}
                  </div>
                )}

                {/* Grid Metadata details */}
                <div className="flex flex-col gap-2 text-[11px] bg-slate-950/50 p-3.5 rounded-xl border border-[var(--border-primary)]">
                  <div className="flex justify-between py-1 border-b border-[var(--border-primary)]/40">
                    <span style={{ color: 'var(--text-tertiary)' }}>Package version</span>
                    <span className="font-mono text-slate-200">{pkgDetail.version}</span>
                  </div>
                  {pkgDetail.votes !== undefined && (
                    <div className="flex justify-between py-1 border-b border-[var(--border-primary)]/40">
                      <span style={{ color: 'var(--text-tertiary)' }}>AUR Vote Weight</span>
                      <span className="font-semibold text-slate-200 flex items-center gap-0.5">
                        <Star size={11} className="text-amber-500 fill-amber-500" /> {pkgDetail.votes}
                      </span>
                    </div>
                  )}
                  {pkgDetail.maintainer && (
                    <div className="flex justify-between py-1">
                      <span style={{ color: 'var(--text-tertiary)' }}>AUR Maintainer</span>
                      <span className="font-bold text-slate-200">{pkgDetail.maintainer}</span>
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="text-center py-20 text-slate-400 flex flex-col items-center gap-3">
                <Shield size={32} className="text-slate-500" />
                <p className="text-xs font-semibold text-slate-300">Select a Package for Details</p>
                <p className="text-[10px] max-w-[200px] leading-relaxed">
                  Click on any searched package to review security scans, versions, votes, and maintainer specifications instantly.
                </p>
              </div>
            )}
          </div>

        </div>
      ) : (
        /* Empty State Illustration */
        <div className="card p-16 text-center flex flex-col items-center justify-center gap-4 max-w-2xl mx-auto mt-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-slate-900 border border-[var(--border-glow)]"
               style={{ boxShadow: 'var(--shadow-glow)' }}>
            <Search size={28} className="text-[var(--accent)]" />
          </div>
          <h2 className="text-lg font-extrabold text-white">Find Arch Software Instantly</h2>
          <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
            Search across official core, extra, multilib repositories, and the community-driven AUR. Use the top navigation bar to initialize queries.
          </p>
        </div>
      )}
    </div>
  );
}
