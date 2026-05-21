import { useEffect, useState } from 'react';
import { ArrowDownToLine, Shield, CheckCircle } from 'lucide-react';
import { useTheme } from '../lib/theme';
import { api } from '../lib/api';
import type { UpdatePackage } from '../types';

interface UpdatesProps {
  onSelectPackage: (name: string) => void;
  onUpdatesLoaded: (count: number) => void;
}

export default function Updates({ onSelectPackage, onUpdatesLoaded }: UpdatesProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [updates, setUpdates] = useState<UpdatePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadUpdates();
  }, []);

  const loadUpdates = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.checkUpdates();
      setUpdates(data.results);
      setSelected(new Set(data.results.map(u => u.name)));
      onUpdatesLoaded(data.count);
    } catch (err: any) {
      setError(err.message || 'Failed to check updates');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    setApplying(true);
    try {
      await api.applyUpdates();
      await loadUpdates();
    } catch (err: any) {
      setError(err.message || 'Update failed');
    } finally {
      setApplying(false);
    }
  };

  const toggleSelect = (name: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === updates.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(updates.map(u => u.name)));
    }
  };

  const securityUpdates = updates.filter(u =>
    u.name.startsWith('linux') || u.name.includes('openssl') || u.name.includes('gnutls') ||
    u.name.includes('nss') || u.name.includes('ca-certificates')
  );
  const regularUpdates = updates.filter(u => !securityUpdates.includes(u));

  const panelClass = `border rounded-sm ${
    isDark ? 'bg-dark-panel border-dark-border' : 'bg-light-panel border-light-border'
  }`;
  const secondaryText = isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary';

  const renderTable = (items: UpdatePackage[], title: string, icon: React.ReactNode) => (
    <div className={panelClass}>
      <div className={`px-3 py-2 border-b flex items-center justify-between ${isDark ? 'border-dark-border' : 'border-light-border'}`}>
        <span className={`text-sm font-medium flex items-center gap-1.5 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
          {icon}
          {title}
          <span className={`text-xs ${secondaryText}`}>({items.length})</span>
        </span>
      </div>
      {items.length === 0 ? (
        <div className={`p-3 text-sm ${secondaryText}`}>None available.</div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className={`text-left text-xs ${secondaryText}`}>
              <th className="px-3 py-1.5 font-medium w-8">
                <input
                  type="checkbox"
                  checked={items.every(u => selected.has(u.name))}
                  onChange={toggleAll}
                  className="accent-arch-blue"
                />
              </th>
              <th className="px-3 py-1.5 font-medium">Package</th>
              <th className="px-3 py-1.5 font-medium">Current Version</th>
              <th className="px-3 py-1.5 font-medium">New Version</th>
              <th className="px-3 py-1.5 font-medium">Source</th>
            </tr>
          </thead>
          <tbody>
            {items.map(u => (
              <tr
                key={u.name}
                className={`border-t cursor-pointer ${
                  isDark
                    ? 'border-dark-border hover:bg-dark-hover'
                    : 'border-light-border hover:bg-light-hover'
                }`}
                onClick={() => toggleSelect(u.name)}
              >
                <td className="px-3 py-1.5">
                  <input
                    type="checkbox"
                    checked={selected.has(u.name)}
                    onChange={() => toggleSelect(u.name)}
                    className="accent-arch-blue"
                  />
                </td>
                <td
                  className="px-3 py-1.5 text-arch-blue font-medium whitespace-nowrap"
                  onClick={e => { e.stopPropagation(); onSelectPackage(u.name); }}
                >
                  {u.name}
                </td>
                <td className={`px-3 py-1.5 text-xs font-mono ${secondaryText}`}>
                  {u.current_version}
                </td>
                <td className="px-3 py-1.5 text-xs font-mono text-green-400">
                  {u.new_version}
                </td>
                <td className="px-3 py-1.5">
                  <span className={`text-xs px-1.5 py-0.5 rounded-sm ${
                    u.source === 'aur'
                      ? 'bg-arch-blue-light text-arch-blue'
                      : isDark ? 'bg-dark-active text-dark-text-secondary' : 'bg-light-active text-light-text-secondary'
                  }`}>
                    {u.source}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  return (
    <div className="p-4 space-y-4 overflow-y-auto h-full">
      <div className="flex items-center justify-between">
        <h1 className={`text-3xl font-semibold ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
          System Updates
        </h1>
        <div className="flex gap-2">
          <button
            onClick={loadUpdates}
            disabled={loading}
            className={`px-3 py-1.5 text-sm border rounded-sm ${
              isDark
                ? 'border-dark-border text-dark-text-secondary hover:bg-dark-hover'
                : 'border-light-border text-light-text-secondary hover:bg-light-hover'
            } disabled:opacity-50`}
          >
            {loading ? 'Checking...' : 'Check Again'}
          </button>
          <button
            onClick={handleApply}
            disabled={applying || selected.size === 0 || updates.length === 0}
            className="px-4 py-1.5 text-sm bg-arch-blue text-white rounded-sm hover:bg-arch-blue-hover disabled:opacity-50 flex items-center gap-1.5"
          >
            <ArrowDownToLine size={14} />
            {applying ? 'Upgrading...' : `Upgrade (${selected.size})`}
          </button>
        </div>
      </div>

      {error && (
        <div className="px-3 py-2 text-sm border border-red-800 bg-red-900/20 text-red-400 rounded-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className={`${panelClass} p-4 text-sm ${secondaryText}`}>
          Checking for updates...
        </div>
      ) : updates.length === 0 ? (
        <div className={panelClass}>
          <div className="p-6 text-center">
            <CheckCircle size={32} className="mx-auto mb-2 text-green-500" />
            <p className={`text-sm font-medium ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
              System is up to date
            </p>
            <p className={`text-xs mt-1 ${secondaryText}`}>
              All packages are at their latest versions.
            </p>
          </div>
        </div>
      ) : (
        <>
          {securityUpdates.length > 0 &&
            renderTable(securityUpdates, 'Security Updates', <Shield size={14} className="text-yellow-500" />)
          }
          {renderTable(regularUpdates, 'Available Updates', <ArrowDownToLine size={14} className="text-arch-blue" />)}
        </>
      )}
    </div>
  );
}
