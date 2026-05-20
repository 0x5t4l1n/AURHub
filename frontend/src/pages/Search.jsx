import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/client';
import PackageGrid from '../components/PackageGrid';
import { Filter, Search } from 'lucide-react';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState('all');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (query.trim()) performSearch(query, source);
    else setResults([]);
  }, [query, source]);

  async function performSearch(q, s) {
    setLoading(true); setError(null);
    try {
      const data = await api.searchPackages(q, s);
      setResults(data.results || []);
    } catch (err) { setError(err.message); setResults([]); }
    finally { setLoading(false); }
  }

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'pacman', label: 'Official' },
    { id: 'aur', label: 'AUR' },
  ];

  return (
    <div className="animate-slide-up flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="page-title">Search Results</h1>
          <p className="page-subtitle">
            {query ? <>Results for <strong style={{ color: 'var(--text-primary)' }}>"{query}"</strong></> : 'Enter a query to search'}
          </p>
        </div>
        {query && (
          <div className="flex items-center gap-3">
            <div className="flex p-0.5 rounded-lg" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSource(tab.id)}
                  className="px-3 py-1 text-[11px] font-semibold rounded-md transition-all"
                  style={{
                    background: source === tab.id ? 'var(--accent)' : 'transparent',
                    color: source === tab.id ? '#fff' : 'var(--text-tertiary)',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <span className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
              <Filter size={11} /> {results.length} pkg{results.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-lg p-3 text-xs font-medium"
             style={{ background: 'var(--red-muted)', color: 'var(--red)', border: '1px solid rgba(248,113,113,0.15)' }}>
          {error}
        </div>
      )}

      {query ? (
        <PackageGrid packages={results} loading={loading} />
      ) : (
        <div className="flex flex-col items-center justify-center py-14" style={{ color: 'var(--text-tertiary)' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
               style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
            <Search size={18} />
          </div>
          <p className="text-sm font-medium mb-0.5" style={{ color: 'var(--text-secondary)' }}>Start searching</p>
          <p className="text-xs">Type a package name above</p>
        </div>
      )}
    </div>
  );
}
