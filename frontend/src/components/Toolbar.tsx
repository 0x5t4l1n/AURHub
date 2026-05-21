import { Search, Download, RefreshCw, Bell } from 'lucide-react';
import { useTheme } from '../lib/theme';
import type { Page } from '../types';

interface ToolbarProps {
  onNavigate: (page: Page) => void;
  onSync: () => void;
  updatesCount: number;
}

export default function Toolbar({ onNavigate, onSync, updatesCount }: ToolbarProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const btnClass = `flex items-center gap-1.5 px-3 py-1 text-xs border rounded-sm ${
    isDark
      ? 'border-dark-border bg-dark-panel text-dark-text-secondary hover:bg-dark-hover hover:text-dark-text'
      : 'border-light-border bg-light-panel text-light-text-secondary hover:bg-light-hover hover:text-light-text'
  }`;

  return (
    <header
      className={`h-[38px] flex items-center gap-2 px-3 border-b flex-shrink-0 ${
        isDark
          ? 'bg-dark-panel border-dark-border'
          : 'bg-light-panel border-light-border'
      }`}
    >
      {/* Search shortcut */}
      <button onClick={() => onNavigate('search')} className={btnClass}>
        <Search size={13} />
        Search Packages
      </button>

      <div className={`w-px h-5 ${isDark ? 'bg-dark-border' : 'bg-light-border'}`} />

      {/* Quick actions */}
      <button onClick={() => onNavigate('updates')} className={btnClass}>
        <Download size={13} />
        Updates
        {updatesCount > 0 && (
          <span className="ml-1 px-1.5 py-0.5 text-[10px] font-medium bg-arch-blue text-white rounded-sm leading-none">
            {updatesCount}
          </span>
        )}
      </button>

      <button onClick={onSync} className={btnClass}>
        <RefreshCw size={13} />
        Sync
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Notifications */}
      <button className={btnClass}>
        <Bell size={13} />
      </button>
    </header>
  );
}
