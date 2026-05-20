import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import SearchBar from '../components/SearchBar';
import { Menu, X, Sun, Moon, RefreshCw, Rocket, TerminalSquare, Bell } from 'lucide-react';
import api from '../api/client';

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('archstore-theme') || 'dark');
  const [checking, setChecking] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') root.classList.add('light');
    else root.classList.remove('light');
    localStorage.setItem('archstore-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  const handleSearch = (query) => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setSidebarOpen(false);
    }
  };

  const handleSync = async () => {
    setChecking(true);
    try {
      await api.clearCache();
      alert('Local package metadata cache synchronized successfully!');
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="app-layout">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: 'var(--bg-overlay)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Desktop Main Content Shell */}
      <main className="main-content">
        {/* Full-width premium Topbar */}
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="btn-ghost lg:hidden !p-2 rounded-xl"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle menu"
            >
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <div className="topbar-title">
              <span>ArchStore</span>
              <span>Pacman + AUR workspace</span>
            </div>
          </div>

          {/* Large desktop Search input container */}
          <div className="topbar-search">
            <SearchBar onSearch={handleSearch} />
          </div>

          {/* Quick Header Actions */}
          <div className="topbar-actions">
            <button
              className="btn btn-secondary !py-2.5 !px-4 text-sm hidden md:flex items-center gap-2"
              onClick={() => navigate('/search?q=')}
              title="New Search"
            >
              <Rocket size={13} /> Quick Install
            </button>
            <button
              className="btn btn-secondary !py-2.5 !px-3 text-sm hidden md:flex items-center gap-2"
              onClick={() => navigate('/updates')}
              title="Check Updates"
            >
              <TerminalSquare size={13} /> Updates
            </button>
            <button
              onClick={handleSync}
              disabled={checking}
              className="btn btn-secondary !py-2.5 !px-4 text-sm hidden sm:flex items-center gap-2"
              title="Synchronize Local Cache"
            >
              <RefreshCw size={13} className={checking ? 'animate-spin' : ''} />
              <span>Sync</span>
            </button>
            <button className="btn-ghost !p-2 rounded-xl" title="Notifications" aria-label="Notifications">
              <Bell size={16} />
            </button>

            {/* Premium Theme Switch Toggle */}
            <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle theme">
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {/* Profile */}
            <button className="avatar-button" aria-label="Open profile">
              AS
            </button>
          </div>
        </header>

        {/* Constrained layout shell */}
        <div className="content-shell">
          <div className="page-shell">
            <Outlet />
          </div>
        </div>
        <footer className="app-footer">
          Made with ❤️ for Arch Linux
        </footer>
      </main>
    </div>
  );
}
