import { NavLink } from 'react-router-dom';
import {
  Home, Search, Package, RefreshCw, Grid3X3, Settings, X
} from 'lucide-react';
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
      {/* ── Brand ── */}
      <div className="flex items-center justify-between mb-10">
        <NavLink to="/" className="flex items-center gap-3 no-underline" onClick={onClose}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
               style={{
                 background: 'linear-gradient(135deg, var(--accent), var(--violet))',
                 boxShadow: '0 4px 14px var(--accent-glow)'
               }}>
            <span className="text-white font-black text-lg">A</span>
          </div>
          <div>
            <h1 className="text-base font-bold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              ArchStore
            </h1>
            <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>Package Manager</p>
          </div>
        </NavLink>
        <button
          className="lg:hidden btn-ghost !p-1.5"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <X size={18} />
        </button>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex flex-col gap-2 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-widest mb-1 px-4"
           style={{ color: 'var(--text-tertiary)' }}>
          Menu
        </p>
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <Icon size={18} strokeWidth={isOpen ? 2 : 1.8} />
            <span>{label}</span>
            {label === 'Updates' && updateCount > 0 && (
              <span className="ml-auto text-[11px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: 'var(--accent)', color: 'white', minWidth: '22px', textAlign: 'center' }}>
                {updateCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Footer ── */}
      <div className="pt-5 mt-4" style={{ borderTop: '1px solid var(--border-primary)' }}>
        <div className="flex items-center gap-2 px-4 mb-2">
          <span className="w-2 h-2 rounded-full" style={{ background: 'var(--green)' }}></span>
          <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>System Ready</span>
        </div>
        <p className="text-[11px] px-4" style={{ color: 'var(--text-tertiary)' }}>
          v1.0.0 · Arch Linux
        </p>
      </div>
    </aside>
  );
}
