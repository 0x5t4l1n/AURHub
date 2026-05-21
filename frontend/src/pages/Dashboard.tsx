import { useEffect, useState } from 'react';
import {
  Search,
  ArrowDownToLine,
  Package,
  Grid3X3,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { useTheme } from '../lib/theme';
import { api } from '../lib/api';
import type { Page, UpdatePackage } from '../types';

interface DashboardProps {
  onNavigate: (page: Page) => void;
  onSelectPackage: (name: string) => void;
}

export default function Dashboard({ onNavigate, onSelectPackage }: DashboardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [updates, setUpdates] = useState<UpdatePackage[]>([]);
  const [quickSearch, setQuickSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.checkUpdates()
      .then(data => setUpdates(data.results))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const panelClass = `border rounded-sm ${
    isDark ? 'bg-dark-panel border-dark-border' : 'bg-light-panel border-light-border'
  }`;

  const sectionTitle = `text-lg font-medium mb-2 ${isDark ? 'text-dark-text' : 'text-light-text'}`;
  const secondaryText = isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary';

  const popularPackages = [
    { name: 'firefox', desc: 'Standalone web browser from Mozilla', repo: 'extra' },
    { name: 'vim', desc: 'Highly configurable text editor', repo: 'extra' },
    { name: 'git', desc: 'Distributed version control system', repo: 'extra' },
    { name: 'htop', desc: 'Interactive process viewer', repo: 'extra' },
    { name: 'neovim', desc: 'Vim-fork focused on extensibility', repo: 'extra' },
    { name: 'docker', desc: 'Container runtime environment', repo: 'extra' },
    { name: 'nodejs', desc: 'Evented I/O for V8 javascript', repo: 'extra' },
    { name: 'python', desc: 'High-level programming language', repo: 'extra' },
  ];

  const categories = [
    { name: 'Development', icon: '⌨' },
    { name: 'System', icon: '⚙' },
    { name: 'Network', icon: '🌐' },
    { name: 'Multimedia', icon: '🎵' },
    { name: 'Games', icon: '🎮' },
    { name: 'Desktop', icon: '🖥' },
  ];

  const recentActivity = [
    { action: 'Installed', pkg: 'neovim', time: '2 hours ago' },
    { action: 'Updated', pkg: 'firefox', time: '5 hours ago' },
    { action: 'Removed', pkg: 'nano', time: '1 day ago' },
    { action: 'Installed', pkg: 'ripgrep', time: '2 days ago' },
    { action: 'Updated', pkg: 'linux', time: '3 days ago' },
  ];

  return (
    <div className="p-4 space-y-4 overflow-y-auto h-full">
      <h1 className={`text-3xl font-semibold ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
        Dashboard
      </h1>

      {/* Quick search */}
      <div className={panelClass}>
        <div className={`px-3 py-2 border-b ${isDark ? 'border-dark-border' : 'border-light-border'}`}>
          <h2 className={sectionTitle} style={{ marginBottom: 0 }}>Search Packages</h2>
        </div>
        <div className="p-3 flex gap-2">
          <div className="relative flex-1">
            <Search size={14} className={`absolute left-2.5 top-1/2 -translate-y-1/2 ${secondaryText}`} />
            <input
              type="text"
              placeholder="Search pacman and AUR packages..."
              value={quickSearch}
              onChange={e => setQuickSearch(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && quickSearch.trim()) {
                  onNavigate('search');
                }
              }}
              className={`w-full pl-8 pr-3 py-1.5 text-sm border rounded-sm ${
                isDark
                  ? 'bg-dark-bg border-dark-border text-dark-text placeholder:text-dark-text-secondary'
                  : 'bg-light-bg border-light-border text-light-text placeholder:text-light-text-secondary'
              }`}
            />
          </div>
          <button
            onClick={() => onNavigate('search')}
            className="px-4 py-1.5 text-sm bg-arch-blue text-white rounded-sm hover:bg-arch-blue-hover"
          >
            Search
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Updates available */}
        <div className={panelClass}>
          <div className={`px-3 py-2 border-b flex items-center justify-between ${isDark ? 'border-dark-border' : 'border-light-border'}`}>
            <h2 className={sectionTitle} style={{ marginBottom: 0 }}>
              <ArrowDownToLine size={16} className="inline mr-1.5 text-arch-blue" />
              Updates Available
            </h2>
            <button
              onClick={() => onNavigate('updates')}
              className={`text-xs ${secondaryText} hover:text-arch-blue flex items-center gap-0.5`}
            >
              View All <ChevronRight size={12} />
            </button>
          </div>
          <div className="p-3">
            {loading ? (
              <p className={`text-sm ${secondaryText}`}>Checking for updates...</p>
            ) : updates.length === 0 ? (
              <p className={`text-sm ${secondaryText}`}>System is up to date.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className={`text-left text-xs ${secondaryText}`}>
                    <th className="pb-1 font-medium">Package</th>
                    <th className="pb-1 font-medium">Current</th>
                    <th className="pb-1 font-medium">New</th>
                    <th className="pb-1 font-medium">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {updates.slice(0, 5).map(u => (
                    <tr key={u.name} className={`border-t ${isDark ? 'border-dark-border' : 'border-light-border'}`}>
                      <td className="py-1 text-arch-blue cursor-pointer hover:underline" onClick={() => onSelectPackage(u.name)}>
                        {u.name}
                      </td>
                      <td className={`py-1 ${secondaryText}`}>{u.current_version}</td>
                      <td className="py-1">{u.new_version}</td>
                      <td className="py-1">
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
            {updates.length > 5 && (
              <p className={`text-xs mt-2 ${secondaryText}`}>
                and {updates.length - 5} more...
              </p>
            )}
          </div>
        </div>

        {/* Recent activity */}
        <div className={panelClass}>
          <div className={`px-3 py-2 border-b ${isDark ? 'border-dark-border' : 'border-light-border'}`}>
            <h2 className={sectionTitle} style={{ marginBottom: 0 }}>
              <Clock size={16} className="inline mr-1.5 text-arch-blue" />
              Recent Activity
            </h2>
          </div>
          <div className="p-3">
            <table className="w-full text-sm">
              <thead>
                <tr className={`text-left text-xs ${secondaryText}`}>
                  <th className="pb-1 font-medium">Action</th>
                  <th className="pb-1 font-medium">Package</th>
                  <th className="pb-1 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((a, i) => (
                  <tr key={i} className={`border-t ${isDark ? 'border-dark-border' : 'border-light-border'}`}>
                    <td className="py-1">
                      <span className={`text-xs px-1.5 py-0.5 rounded-sm ${
                        a.action === 'Installed'
                          ? 'bg-green-900/30 text-green-400'
                          : a.action === 'Updated'
                            ? 'bg-arch-blue-light text-arch-blue'
                            : 'bg-red-900/30 text-red-400'
                      }`}>
                        {a.action}
                      </span>
                    </td>
                    <td className="py-1 text-arch-blue cursor-pointer hover:underline" onClick={() => onSelectPackage(a.pkg)}>
                      {a.pkg}
                    </td>
                    <td className={`py-1 ${secondaryText}`}>{a.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Popular packages */}
      <div className={panelClass}>
        <div className={`px-3 py-2 border-b ${isDark ? 'border-dark-border' : 'border-light-border'}`}>
          <h2 className={sectionTitle} style={{ marginBottom: 0 }}>
            <Package size={16} className="inline mr-1.5 text-arch-blue" />
            Popular Packages
          </h2>
        </div>
        <div className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className={`text-left text-xs ${secondaryText}`}>
                <th className="px-3 py-1.5 font-medium">Name</th>
                <th className="px-3 py-1.5 font-medium">Description</th>
                <th className="px-3 py-1.5 font-medium">Repository</th>
                <th className="px-3 py-1.5 font-medium w-20"></th>
              </tr>
            </thead>
            <tbody>
              {popularPackages.map(pkg => (
                <tr
                  key={pkg.name}
                  className={`border-t cursor-pointer ${
                    isDark
                      ? 'border-dark-border hover:bg-dark-hover'
                      : 'border-light-border hover:bg-light-hover'
                  }`}
                  onClick={() => onSelectPackage(pkg.name)}
                >
                  <td className="px-3 py-1.5 text-arch-blue font-medium">{pkg.name}</td>
                  <td className={`px-3 py-1.5 ${secondaryText}`}>{pkg.desc}</td>
                  <td className="px-3 py-1.5">
                    <span className={`text-xs px-1.5 py-0.5 rounded-sm ${
                      isDark ? 'bg-dark-active text-dark-text-secondary' : 'bg-light-active text-light-text-secondary'
                    }`}>
                      {pkg.repo}
                    </span>
                  </td>
                  <td className="px-3 py-1.5">
                    <button
                      onClick={e => { e.stopPropagation(); onSelectPackage(pkg.name); }}
                      className="px-2 py-0.5 text-xs bg-arch-blue text-white rounded-sm hover:bg-arch-blue-hover"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Categories */}
      <div className={panelClass}>
        <div className={`px-3 py-2 border-b flex items-center justify-between ${isDark ? 'border-dark-border' : 'border-light-border'}`}>
          <h2 className={sectionTitle} style={{ marginBottom: 0 }}>
            <Grid3X3 size={16} className="inline mr-1.5 text-arch-blue" />
            Categories
          </h2>
          <button
            onClick={() => onNavigate('categories')}
            className={`text-xs ${secondaryText} hover:text-arch-blue flex items-center gap-0.5`}
          >
            View All <ChevronRight size={12} />
          </button>
        </div>
        <div className="p-3 grid grid-cols-6 gap-2">
          {categories.map(cat => (
            <button
              key={cat.name}
              onClick={() => onNavigate('categories')}
              className={`flex items-center gap-2 px-3 py-2 text-sm border rounded-sm text-left ${
                isDark
                  ? 'border-dark-border hover:bg-dark-hover text-dark-text'
                  : 'border-light-border hover:bg-light-hover text-light-text'
              }`}
            >
              <span>{cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
