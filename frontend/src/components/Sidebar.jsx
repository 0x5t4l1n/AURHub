import { NavLink } from 'react-router-dom';
import { Home, Search, Package, RefreshCw, Grid3X3, Settings, X, Shield, Terminal, Server } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../api/client';

const navItems = [
  { path: '/', icon: Home, label: 'Dashboard', section: 'Overview' },
  { path: '/search', icon: Search, label: 'Search Packages', section: 'Manage' },
  { path: '/installed', icon: Package, label: 'Installed', section: 'Manage' },
  { path: '/updates', icon: RefreshCw, label: 'Updates', section: 'Manage' },
  { path: '/categories', icon: Grid3X3, label: 'Browse Categories', section: 'Explore' },
  { path: '/settings', icon: Settings, label: 'Preferences', section: 'System' },
];

export default function Sidebar({ isOpen, onClose }) {
  const [updateCount, setUpdateCount] = useState(0);
  const [dbSize, setDbSize] = useState('0.0 MB');
  const [status, setStatus] = useState('Checking...');

  useEffect(() => {
    // Gather system health and update indicators
    api.checkUpdates()
      .then(data => setUpdateCount(data.count || 0))
      .catch(() => {});

    api.healthCheck()
      .then(health => {
        if (health.status === 'healthy') {
          setStatus('Healthy');
          setDbSize(health.database_size || '1.2 MB');
        } else {
          setStatus('Degraded');
        }
      })
      .catch(() => setStatus('Offline'));
  }, []);

  // Group nav items by section
  const sections = navItems.reduce((acc, item) => {
    if (!acc[item.section]) acc[item.section] = [];
    acc[item.section].push(item);
    return acc;
  }, {});

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      {/* Brand & Logo Header */}
      <div className="flex items-center justify-between mb-8 px-2">
        <NavLink to="/" className="flex items-center gap-3 no-underline" onClick={onClose}>
          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
               style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
            <Terminal size={18} style={{ color: 'var(--accent)' }} />
          </div>
          <div>
            <span className="text-base font-semibold block leading-tight" style={{ color: 'var(--text-primary)' }}>
              ArchStore
            </span>
            <span className="text-[10px] leading-tight font-semibold uppercase tracking-wide block" style={{ color: 'var(--text-tertiary)' }}>
              Package Manager
            </span>
          </div>
        </NavLink>
        <button className="lg:hidden btn-ghost !p-1.5 rounded-lg" onClick={onClose} aria-label="Close">
          <X size={16} />
        </button>
      </div>

      {/* Grouped Sidebar Navigation */}
      <nav className="flex flex-col gap-5 flex-1 overflow-y-auto pr-1">
        {Object.entries(sections).map(([sectionName, items]) => (
          <div key={sectionName} className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-wide px-3 mb-1"
              style={{ color: 'var(--text-tertiary)' }}>
              {sectionName}
            </span>
            {items.map(({ path, icon: Icon, label }) => (
              <NavLink
                key={path}
                to={path}
                end={path === '/'}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <Icon size={18} strokeWidth={1.8} />
                <span className="font-medium">{label}</span>
                {label === 'Updates' && updateCount > 0 && (
                  <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-primary)' }}>
                    {updateCount}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* bottom system status dock */}
      <div className="pt-4 mt-auto border-t border-[var(--border-primary)] flex flex-col gap-3">
        <div className="flex items-center justify-between px-2 text-[11px]">
          <span className="flex items-center gap-1.5" style={{ color: 'var(--text-tertiary)' }}>
            <Server size={11} /> API Service
          </span>
          <span className="font-semibold flex items-center gap-1"
                style={{ color: status === 'Healthy' ? 'var(--green)' : 'var(--red)' }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: status === 'Healthy' ? 'var(--green)' : 'var(--red)' }}></span>
            {status}
          </span>
        </div>

        <div className="flex items-center justify-between px-2 text-[11px]">
          <span className="flex items-center gap-1.5" style={{ color: 'var(--text-tertiary)' }}>
            <Shield size={11} /> Package DB
          </span>
          <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>{dbSize}</span>
        </div>

        <div className="flex items-center gap-2 px-2">
          <div className="w-2 h-2 rounded-full" style={{ background: 'var(--accent)' }}></div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Arch Linux OS</p>
            <p className="text-[9px] font-mono truncate" style={{ color: 'var(--text-tertiary)' }}>Local Port: 5173</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
