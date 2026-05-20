import { NavLink } from 'react-router-dom';
import { Home, Search, Package, RefreshCw, Grid3X3, Settings, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../api/client';

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/search', icon: Search, label: 'Search' },
  { path: '/installed', icon: Package, label: 'Installed' },
  { path: '/updates', icon: RefreshCw, label: 'Updates' },
  { path: '/categories', icon: Grid3X3, label: 'Categories' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar({ isOpen, onClose }) {
  const [updateCount, setUpdateCount] = useState(0);

  useEffect(() => {
    api.checkUpdates()
      .then(data => setUpdateCount(data.count || 0))
      .catch(() => {});
  }, []);

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      {/* Brand */}
      <div className="flex items-center justify-between mb-6 px-1">
        <NavLink to="/" className="flex items-center gap-2.5 no-underline" onClick={onClose}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
               style={{
                 background: 'linear-gradient(135deg, var(--accent), var(--violet))',
               }}>
            <span className="text-white font-black text-xs">A</span>
          </div>
          <div>
            <span className="text-sm font-bold block leading-tight" style={{ color: 'var(--text-primary)' }}>
              ArchStore
            </span>
            <span className="text-[10px] leading-tight" style={{ color: 'var(--text-tertiary)' }}>
              Package Manager
            </span>
          </div>
        </NavLink>
        <button className="lg:hidden btn-ghost !p-1" onClick={onClose} aria-label="Close">
          <X size={14} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 flex-1">
        <span className="text-[9px] font-bold uppercase tracking-widest px-3 mb-1"
              style={{ color: 'var(--text-tertiary)' }}>
          Navigation
        </span>
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <Icon size={15} strokeWidth={1.8} />
            <span>{label}</span>
            {label === 'Updates' && updateCount > 0 && (
              <span className="ml-auto text-[10px] font-bold px-1.5 py-px rounded-full"
                    style={{ background: 'var(--accent)', color: '#fff', minWidth: '18px', textAlign: 'center' }}>
                {updateCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="pt-3 mt-2 px-3" style={{ borderTop: '1px solid var(--border-primary)' }}>
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--green)' }}></span>
          <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>System Ready</span>
        </div>
        <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>v1.0.0 · Arch Linux</span>
      </div>
    </aside>
  );
}
