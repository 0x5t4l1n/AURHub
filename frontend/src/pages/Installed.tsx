import { useEffect, useState } from 'react';
import { Trash2, Info } from 'lucide-react';
import { useTheme } from '../lib/theme';
import { api } from '../lib/api';
import type { Package } from '../types';

interface InstalledProps {
  onSelectPackage: (name: string) => void;
}

export default function Installed({ onSelectPackage }: InstalledProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    setLoading(true);
    try {
      const data = await api.listInstalled();
      setPackages(data.results);
    } catch (err: any) {
      setError(err.message || 'Failed to load installed packages');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (name: string) => {
    setRemoving(name);
    try {
      await api.removePackage(name);
      await loadPackages();
    } catch {
      // silently fail
    } finally {
      setRemoving(null);
    }
  };

  const filtered = packages.filter(pkg => {
    const matchesName = pkg.name.toLowerCase().includes(filter.toLowerCase());
    const matchesSource = sourceFilter === 'all' || pkg.source === sourceFilter;
    return matchesName && matchesSource;
  });

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
      <div className="flex items-center justify-between">
        <h1 className={`text-3xl font-semibold ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
          Installed Packages
        </h1>
        <span className={`text-sm ${secondaryText}`}>
          {packages.length} total, {filtered.length} shown
        </span>
      </div>

      {/* Filters */}
      <div className={panelClass}>
        <div className="p-3 flex gap-2 items-center">
          <input
            type="text"
            value={filter}
            onChange={e => setFilter(e.target.value)}
            placeholder="Filter packages..."
            className={`${inputClass} flex-1`}
          />
          <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)} className={selectClass}>
            <option value="all">All Sources</option>
            <option value="pacman">Pacman</option>
            <option value="aur">AUR</option>
          </select>
          <button
            onClick={loadPackages}
            className={`px-3 py-1.5 text-sm border rounded-sm ${
              isDark
                ? 'border-dark-border text-dark-text-secondary hover:bg-dark-hover'
                : 'border-light-border text-light-text-secondary hover:bg-light-hover'
            }`}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="px-3 py-2 text-sm border border-red-800 bg-red-900/20 text-red-400 rounded-sm">
          {error}
        </div>
      )}

      {/* Package list */}
      <div className={panelClass}>
        {loading ? (
          <div className={`p-4 text-sm ${secondaryText}`}>Loading installed packages...</div>
        ) : filtered.length === 0 ? (
          <div className={`p-4 text-sm text-center ${secondaryText}`}>
            {filter ? `No packages matching "${filter}".` : 'No installed packages found.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`text-left text-xs ${secondaryText}`}>
                  <th className="px-3 py-1.5 font-medium">Package</th>
                  <th className="px-3 py-1.5 font-medium">Description</th>
                  <th className="px-3 py-1.5 font-medium">Version</th>
                  <th className="px-3 py-1.5 font-medium">Source</th>
                  <th className="px-3 py-1.5 font-medium w-28"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(pkg => (
                  <tr
                    key={pkg.name}
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
                    <td className={`px-3 py-1.5 ${secondaryText} max-w-[350px] truncate`}>
                      {pkg.description}
                    </td>
                    <td className={`px-3 py-1.5 text-xs font-mono ${secondaryText}`}>
                      {pkg.version}
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
                    <td className="px-3 py-1.5 flex gap-1">
                      <button
                        onClick={e => { e.stopPropagation(); onSelectPackage(pkg.name); }}
                        className={`p-1 rounded-sm ${
                          isDark
                            ? 'text-dark-text-secondary hover:bg-dark-hover hover:text-dark-text'
                            : 'text-light-text-secondary hover:bg-light-hover hover:text-light-text'
                        }`}
                        title="Info"
                      >
                        <Info size={14} />
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); handleRemove(pkg.name); }}
                        disabled={removing === pkg.name}
                        className="p-1 rounded-sm text-red-400 hover:bg-red-900/20 disabled:opacity-50"
                        title="Remove"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
