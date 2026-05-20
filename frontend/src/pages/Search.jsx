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
    setLoading(true);
    setError(null);
    try {
      const data = await api.searchPackages(q, s);
      setResults(data.results || []);
    } catch (err) {
      setError(err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'pacman', label: 'Official' },
    { id: 'aur', label: 'AUR' },
  ];

  return (
    <div className="animate-slide-up">
      {/* Header */}
      <div className="mb-8">
        <h1 className="page-title">Search Results</h1>
        <p className="page-subtitle">
          {query ? <>Showing results for <strong style={{ color: 'var(--text-primary)' }}>"{query}"</strong></> : 'Enter a query to search packages'}
        </p>
      </div>

      {query && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          {/* Source tabs */}
          <div className="flex p-1 rounded-xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSource(tab.id)}
                className="px-5 py-2 text-xs font-semibold rounded-lg transition-all"
                style={{
                  background: source === tab.id ? 'var(--accent)' : 'transparent',
                  color: source === tab.id ? 'white' : 'var(--text-secondary)',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
            <Filter size={13} />
            {results.length} package{results.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl p-4 mb-6 text-sm font-medium"
             style={{ background: 'var(--red-muted)', color: 'var(--red)', border: '1px solid rgba(239,68,68,0.2)' }}>
          {error}
        </div>
      )}

      {query ? (
        <PackageGrid packages={results} loading={loading} />
      ) : (
        <div className="flex flex-col items-center justify-center py-24" style={{ color: 'var(--text-tertiary)' }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
               style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
            <Search size={28} />
          </div>
          <p className="text-base font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Start searching</p>
          <p className="text-sm">Type a package name or keyword above</p>
        </div>
      )}
    </div>
  );
}
