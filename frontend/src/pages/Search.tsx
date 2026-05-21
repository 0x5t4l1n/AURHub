import { useState } from 'react';
import { Search as SearchIcon, Download } from 'lucide-react';
import { useTheme } from '../lib/theme';
import { api } from '../lib/api';
import type { Package } from '../types';

interface SearchProps {
  onSelectPackage: (name: string) => void;
}

export default function SearchPage({ onSelectPackage }: SearchProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [query, setQuery] = useState('');
  const [source, setSource] = useState('all');
  const [sort, setSort] = useState('name');
  const [results, setResults] = useState<Package[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');
  const [installing, setInstalling] = useState<string | null>(null);

  const doSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setSearched(true);
    try {
      const data = await api.searchPackages(query.trim(), source);
      let sorted = [...data.results];
      if (sort === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name));
      else if (sort === 'repo') sorted.sort((a, b) => a.repository.localeCompare(b.repository));
      setResults(sorted);
    } catch (err: any) {
      setError(err.message || 'Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInstall = async (name: string) => {
    setInstalling(name);
    try {
      await api.installPackage(name);
      // Refresh search
      await doSearch();
    } catch {
      // silently fail for demo
    } finally {
      setInstalling(null);
    }
  };

  const panelClass = `border rounded-sm ${
    isDark ? 'bg-dark-panel border-dark-border' : 'bg-light-panel border-light-border'
  }`;
  const secondaryText = isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary';
  const inputClass = `px-3 py-1.5 text-sm border rounded-sm ${
    isDark
      ? 'bg-dark-bg border-dark-border text-dark-text'
      : 'bg-light-bg border-light-border text-light-text'
  }`;
  const selectClass = `px-2 py-1.5 text-sm border rounded-sm ${
    isDark
      ? 'bg-dark-bg border-dark-border text-dark-text'
      : 'bg-light-bg border-light-border text-light-text'
  }`;

  return (
    <div className="p-4 space-y-4 overflow-y-auto h-full">
      <h1 className={`text-3xl font-semibold ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
        Search Packages
      </h1>

      {/* Search controls */}
      <div className={panelClass}>
        <div className={`px-3 py-2 border-b ${isDark ? 'border-dark-border' : 'border-light-border'}`}>
          <span className={`text-sm font-medium ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
            Search Options
          </span>
        </div>
        <div className="p-3 flex gap-2 items-end flex-wrap">
          <div className="flex-1 min-w-[250px]">
            <label className={`block text-xs mb-1 ${secondaryText}`}>Package Name</label>
            <div className="relative">
              <SearchIcon size={14} className={`absolute left-2.5 top-1/2 -translate-y-1/2 ${secondaryText}`} />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && doSearch()}
                placeholder="Enter package name..."
                className={`${inputClass} w-full pl-8`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-xs mb-1 ${secondaryText}`}>Repository</label>
            <select value={source} onChange={e => setSource(e.target.value)} className={selectClass}>
              <option value="all">All Sources</option>
              <option value="pacman">Pacman Only</option>
              <option value="aur">AUR Only</option>
            </select>
          </div>

          <div>
            <label className={`block text-xs mb-1 ${secondaryText}`}>Sort By</label>
            <select value={sort} onChange={e => setSort(e.target.value)} className={selectClass}>
              <option value="name">Name</option>
              <option value="repo">Repository</option>
            </select>
          </div>

          <button
            onClick={doSearch}
            disabled={loading || !query.trim()}
            className="px-4 py-1.5 text-sm bg-arch-blue text-white rounded-sm hover:bg-arch-blue-hover disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {/* Results */}
      {error && (
        <div className="px-3 py-2 text-sm border border-red-800 bg-red-900/20 text-red-400 rounded-sm">
          {error}
        </div>
      )}

      {searched && (
        <div className={panelClass}>
          <div className={`px-3 py-2 border-b flex items-center justify-between ${isDark ? 'border-dark-border' : 'border-light-border'}`}>
            <span className={`text-sm font-medium ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
              Results
            </span>
            <span className={`text-xs ${secondaryText}`}>
              {results.length} package{results.length !== 1 ? 's' : ''} found
            </span>
          </div>

          {results.length === 0 && !loading ? (
            <div className={`p-4 text-sm text-center ${secondaryText}`}>
              No packages found matching "{query}".
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={`text-left text-xs ${secondaryText}`}>
                    <th className="px-3 py-1.5 font-medium">Package</th>
                    <th className="px-3 py-1.5 font-medium">Description</th>
                    <th className="px-3 py-1.5 font-medium">Repository</th>
                    <th className="px-3 py-1.5 font-medium">Version</th>
                    <th className="px-3 py-1.5 font-medium">Status</th>
                    <th className="px-3 py-1.5 font-medium w-24"></th>
                  </tr>
                </thead>
                <tbody>
                  {results.map(pkg => (
                    <tr
                      key={`${pkg.name}-${pkg.source}`}
                      className={`border-t cursor-pointer ${
                        isDark
                          ? 'border-dark-border hover:bg-dark-hover'
                          : 'border-light-border hover:bg-light-hover'
                      }`}
                      onClick={() => onSelectPackage(pkg.name)}
                    >
                      <td className="px-3 py-1.5 text-arch-blue font-medium whitespace-nowrap">
                        {pkg.name}
                      </td>
                      <td className={`px-3 py-1.5 ${secondaryText} max-w-[300px] truncate`}>
                        {pkg.description}
                      </td>
                      <td className="px-3 py-1.5">
                        <span className={`text-xs px-1.5 py-0.5 rounded-sm ${
                          pkg.source === 'aur'
                            ? 'bg-arch-blue-light text-arch-blue'
                            : isDark ? 'bg-dark-active text-dark-text-secondary' : 'bg-light-active text-light-text-secondary'
                        }`}>
                          {pkg.source === 'aur' ? 'AUR' : pkg.repository || 'pacman'}
                        </span>
                      </td>
                      <td className={`px-3 py-1.5 text-xs font-mono ${secondaryText}`}>
                        {pkg.version}
                      </td>
                      <td className="px-3 py-1.5">
                        {pkg.installed ? (
                          <span className="text-xs text-green-500">Installed</span>
                        ) : (
                          <span className={`text-xs ${secondaryText}`}>Not installed</span>
                        )}
                      </td>
                      <td className="px-3 py-1.5">
                        {pkg.installed ? (
                          <button
                            onClick={e => { e.stopPropagation(); onSelectPackage(pkg.name); }}
                            className={`px-2 py-0.5 text-xs border rounded-sm ${
                              isDark
                                ? 'border-dark-border text-dark-text-secondary hover:bg-dark-hover'
                                : 'border-light-border text-light-text-secondary hover:bg-light-hover'
                            }`}
                          >
                            Info
                          </button>
                        ) : (
                          <button
                            onClick={e => { e.stopPropagation(); handleInstall(pkg.name); }}
                            disabled={installing === pkg.name}
                            className="px-2 py-0.5 text-xs bg-arch-blue text-white rounded-sm hover:bg-arch-blue-hover disabled:opacity-50 flex items-center gap-1"
                          >
                            <Download size={11} />
                            {installing === pkg.name ? '...' : 'Install'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
