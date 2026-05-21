import {
  Home,
  Search,
  Package,
  ArrowDownToLine,
  Grid3X3,
  Settings,
  Sun,
  Moon,
} from 'lucide-react';
import { useTheme } from '../lib/theme';
import type { Page } from '../types';

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
}

const navItems: { id: Page; label: string; icon: typeof Home }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'search', label: 'Search Packages', icon: Search },
  { id: 'installed', label: 'Installed', icon: Package },
  { id: 'updates', label: 'Updates', icon: ArrowDownToLine },
  { id: 'categories', label: 'Categories', icon: Grid3X3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ activePage, onNavigate }: SidebarProps) {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  return (
    <aside
      className={`w-[220px] flex-shrink-0 h-full flex flex-col border-r ${
        isDark
          ? 'bg-dark-panel border-dark-border'
          : 'bg-light-panel border-light-border'
      }`}
    >
      {/* App title */}
      <div
        className={`px-4 py-3 border-b font-semibold text-sm flex items-center gap-2 ${
          isDark ? 'border-dark-border' : 'border-light-border'
        }`}
      >
        <Package size={18} className="text-arch-blue" />
        <span>ArchStore</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-1">
        {navItems.map(({ id, label, icon: Icon }) => {
          const active = activePage === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`w-full flex items-center gap-2.5 px-4 py-1.5 text-sm text-left ${
                active
                  ? isDark
                    ? 'bg-dark-active text-arch-blue'
                    : 'bg-light-active text-arch-blue'
                  : isDark
                    ? 'text-dark-text-secondary hover:bg-dark-hover hover:text-dark-text'
                    : 'text-light-text-secondary hover:bg-light-hover hover:text-light-text'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          );
        })}
      </nav>

      {/* Theme toggle */}
      <div className={`px-3 py-2 border-t ${isDark ? 'border-dark-border' : 'border-light-border'}`}>
        <button
          onClick={toggle}
          className={`w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded-sm ${
            isDark
              ? 'text-dark-text-secondary hover:bg-dark-hover hover:text-dark-text'
              : 'text-light-text-secondary hover:bg-light-hover hover:text-light-text'
          }`}
        >
          {isDark ? <Sun size={14} /> : <Moon size={14} />}
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>
    </aside>
  );
}
