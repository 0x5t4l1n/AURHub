import { useState, useCallback } from 'react';
import { Search } from 'lucide-react';

export default function SearchBar({ onSearch, initialQuery = '' }) {
  const [query, setQuery] = useState(initialQuery);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (query.trim()) onSearch(query);
  }, [query, onSearch]);

  return (
    <form onSubmit={handleSubmit} className="searchbar">
      <Search
        size={14}
        className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: 'var(--text-tertiary)' }}
      />
      <input
        id="search-input"
        type="text"
        className="input input-search pl-8 pr-4 rounded-lg"
        style={{ fontSize: '12px' }}
        placeholder="Search packages..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoComplete="off"
        spellCheck="false"
      />
    </form>
  );
}
