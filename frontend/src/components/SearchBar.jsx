import { useState, useCallback } from 'react';
import { Search } from 'lucide-react';

export default function SearchBar({ onSearch, initialQuery = '' }) {
  const [query, setQuery] = useState(initialQuery);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (query.trim()) onSearch(query);
  }, [query, onSearch]);

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl relative">
      <Search
        size={17}
        className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: 'var(--text-tertiary)' }}
      />
      <input
        id="search-input"
        type="text"
        className="input pl-11 pr-5 py-3 rounded-xl"
        style={{ background: 'var(--bg-secondary)', fontSize: '0.9rem' }}
        placeholder="Search packages..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoComplete="off"
        spellCheck="false"
      />
    </form>
  );
}
