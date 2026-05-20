import { useState, useEffect } from 'react';
import api from '../api/client';
import PackageGrid from '../components/PackageGrid';
import { RefreshCw, Search, LayoutGrid, List } from 'lucide-react';

export default function Installed() {
  const [packages, setPackages] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!filter.trim()) { setFiltered(packages); return; }
    const q = filter.toLowerCase();
    setFiltered(packages.filter(p =>
      p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q))
    ));
  }, [filter, packages]);

  async function load() {
    setLoading(true); setError(null);
    try { const data = await api.listInstalled(); setPackages(data.results || []); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="animate-slide-up flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Installed Packages</h1>
          <p className="page-subtitle">
            {packages.length > 0 ? `${packages.length} packages on your system` : 'Loading...'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex p-1 rounded-md" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
            <button onClick={() => setViewMode('grid')}
                    className="p-1.5 rounded transition-all"
                    style={{ background: viewMode === 'grid' ? 'var(--accent-muted)' : 'transparent', color: viewMode === 'grid' ? 'var(--accent)' : 'var(--text-tertiary)' }}>
              <LayoutGrid size={13} />
            </button>
            <button onClick={() => setViewMode('list')}
                    className="p-1.5 rounded transition-all"
                    style={{ background: viewMode === 'list' ? 'var(--accent-muted)' : 'transparent', color: viewMode === 'list' ? 'var(--accent)' : 'var(--text-tertiary)' }}>
              <List size={13} />
            </button>
          </div>
          <button onClick={load} disabled={loading} className="btn btn-secondary text-xs">
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg p-3 text-xs font-medium"
             style={{ background: 'var(--red-muted)', color: 'var(--red)', border: '1px solid rgba(248,113,113,0.15)' }}>
          {error}
        </div>
      )}

      {/* Filter */}
      {!loading && packages.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative max-w-sm w-full">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              className="input pl-10 py-2 text-sm rounded-lg"
              placeholder="Filter packages..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          <span className="pill">
            {filtered.length} visible
          </span>
        </div>
      )}

      {/* Package List */}
      {viewMode === 'grid' ? (
        <PackageGrid packages={filtered} loading={loading} />
      ) : (
        loading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card p-4 flex items-center gap-3">
                <div className="shimmer h-4 w-32"></div>
                <div className="shimmer h-3 w-16"></div>
                <div className="flex-1"></div>
                <div className="shimmer h-3 w-48"></div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-xs text-center py-8" style={{ color: 'var(--text-tertiary)' }}>No packages found</p>
        ) : (
          <div className="data-table max-h-[520px] overflow-y-auto">
            <div className="table-head">
              <span>Package</span>
              <span>Version</span>
              <span>Source</span>
              <span>Description</span>
              <span>Status</span>
            </div>
            {filtered.map((pkg) => (
              <div key={`${pkg.source}-${pkg.name}`}
                   className="table-row cursor-pointer"
                   onClick={() => window.location.href = `/package/${pkg.name}`}>
                <span className="font-semibold text-slate-100 truncate">{pkg.name}</span>
                <span className="font-mono text-xs text-slate-400 truncate">{pkg.version}</span>
                <span className={`badge ${pkg.source === 'aur' ? 'badge-aur' : 'badge-pacman'} text-[9px] w-fit`}>
                  {pkg.source === 'aur' ? 'AUR' : 'pacman'}
                </span>
                <span className="text-xs text-slate-400 truncate">{pkg.description || '—'}</span>
                <span className="text-xs font-semibold" style={{ color: 'var(--green)' }}>Installed</span>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
