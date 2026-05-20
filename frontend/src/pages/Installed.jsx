import { useState, useEffect } from 'react';
import api from '../api/client';
import PackageGrid from '../components/PackageGrid';
import { RefreshCw, Search } from 'lucide-react';

export default function Installed() {
  const [packages, setPackages] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [error, setError] = useState(null);

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
    try {
      const data = await api.listInstalled();
      setPackages(data.results || []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="page-title">Installed Packages</h1>
          <p className="page-subtitle">
            {packages.length > 0 ? `${packages.length} packages installed on your system` : 'Loading installed packages...'}
          </p>
        </div>
        <button onClick={load} disabled={loading} className="btn btn-secondary">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-xl p-4 mb-6 text-sm font-medium"
             style={{ background: 'var(--red-muted)', color: 'var(--red)', border: '1px solid rgba(239,68,68,0.2)' }}>
          {error}
        </div>
      )}

      {!loading && packages.length > 0 && (
        <div className="relative max-w-sm mb-8">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
          <input
            id="installed-filter"
            type="text"
            className="input pl-10 py-2.5 text-sm rounded-xl"
            placeholder="Filter installed packages..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      )}

      <PackageGrid packages={filtered} loading={loading} />
    </div>
  );
}
