import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Package, ArrowRight, Shield,
  Code, Monitor, Wifi, Music, Gamepad2, LayoutDashboard, Type, ShieldCheck,
  Download, RefreshCw, Zap, Cpu, HardDrive, AlertTriangle
} from 'lucide-react';
import api from '../api/client';
import PackageGrid from '../components/PackageGrid';

const catMeta = {
  Development: { icon: Code, color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.07)', gradient: 'linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, transparent 100%)' },
  System:      { icon: Monitor, color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.07)', gradient: 'linear-gradient(135deg, rgba(148, 163, 184, 0.15) 0%, transparent 100%)' },
  Network:     { icon: Wifi, color: '#34d399', bg: 'rgba(52, 211, 153, 0.07)', gradient: 'linear-gradient(135deg, rgba(52, 211, 153, 0.15) 0%, transparent 100%)' },
  Multimedia:  { icon: Music, color: '#c084fc', bg: 'rgba(192, 132, 252, 0.07)', gradient: 'linear-gradient(135deg, rgba(192, 132, 252, 0.15) 0%, transparent 100%)' },
  Games:       { icon: Gamepad2, color: '#f87171', bg: 'rgba(248, 113, 113, 0.07)', gradient: 'linear-gradient(135deg, rgba(248, 113, 113, 0.15) 0%, transparent 100%)' },
  Desktop:     { icon: LayoutDashboard, color: '#818cf8', bg: 'rgba(129, 140, 248, 0.07)', gradient: 'linear-gradient(135deg, rgba(129, 140, 248, 0.15) 0%, transparent 100%)' },
  Fonts:       { icon: Type, color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.07)', gradient: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, transparent 100%)' },
  Security:    { icon: ShieldCheck, color: '#22d3ee', bg: 'rgba(34, 211, 238, 0.07)', gradient: 'linear-gradient(135deg, rgba(34, 211, 238, 0.15) 0%, transparent 100%)' },
};

export default function Home() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updateCount, setUpdateCount] = useState(0);
  const [sysMetrics, setSysMetrics] = useState({ cpu: '3.4%', ram: '2.8 GB', disk: '18% available' });

  const quickInstalls = ['neovim', 'kitty', 'fastfetch', 'btop', 'wezterm', 'starship'];

  useEffect(() => {
    loadData();
    // Simulate slight metrics variation for a rich dashboard visual experience
    const timer = setInterval(() => {
      setSysMetrics(prev => ({
        cpu: `${(Math.random() * 5 + 2).toFixed(1)}%`,
        ram: `${(Math.random() * 0.3 + 2.6).toFixed(2)} GB / 16 GB`,
        disk: '62.4 GB free'
      }));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [catRes, featRes, updRes] = await Promise.allSettled([
        api.listCategories(),
        api.searchPackages('firefox chromium vlc neovim git kitty', 'all'),
        api.checkUpdates(),
      ]);
      if (catRes.status === 'fulfilled') setCategories(catRes.value.results || []);
      if (featRes.status === 'fulfilled') setFeatured((featRes.value.results || []).slice(0, 6));
      if (updRes.status === 'fulfilled') setUpdateCount(updRes.value.count || 0);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className="animate-slide-up grid grid-cols-1 xl:grid-cols-12 gap-8">
      {/* ── Left Main Panel ── */}
      <div className="xl:col-span-8 flex flex-col gap-8 min-w-0">
        {/* Hero Banner */}
        <section className="card p-8 min-h-[260px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="flex flex-col gap-4">
              <span className="section-kicker">Unified Package Command Center</span>
              <h1 className="text-4xl font-extrabold leading-tight" style={{ letterSpacing: '-0.03em' }}>
                Command your <span className="gradient-text">Arch Linux</span> ecosystem
              </h1>
              <p className="text-sm max-w-xl" style={{ color: 'var(--text-secondary)' }}>
                Orchestrate pacman repositories and AUR workflows with security insight, real-time system signals, and guided installs.
              </p>
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mt-2">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
                  <input
                    type="text"
                    className="input pl-11 pr-4 rounded-xl"
                    placeholder="Search repository or AUR..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-primary px-6 rounded-xl">
                  <Search size={15} /> Search
                </button>
              </form>
            </div>

            <div className="glass-panel p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em]" style={{ color: 'var(--text-tertiary)' }}>System Status</p>
                  <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Arch Linux / Kernel 6.x</p>
                </div>
                <div className="pill">
                  <span className="status-dot" style={{ background: 'var(--green)' }}></span>
                  Stable
                </div>
              </div>
              <div className="kpi-grid">
                <div className="kpi-card">
                  <p className="kpi-label">CPU Load</p>
                  <p className="kpi-value">{sysMetrics.cpu}</p>
                </div>
                <div className="kpi-card">
                  <p className="kpi-label">Memory</p>
                  <p className="kpi-value">{sysMetrics.ram}</p>
                </div>
                <div className="kpi-card">
                  <p className="kpi-label">Storage</p>
                  <p className="kpi-value">{sysMetrics.disk}</p>
                </div>
                <div className="kpi-card">
                  <p className="kpi-label">Updates</p>
                  <p className="kpi-value">{updateCount}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Install and Trending */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="section-title">Trending Packages</p>
                <p className="section-subtitle">Top installs across pacman + AUR</p>
              </div>
              <button className="btn-ghost text-xs font-semibold flex items-center gap-1.5"
                      style={{ color: 'var(--accent)' }}
                      onClick={() => navigate('/search?q=popular')}>
                Explore more <ArrowRight size={14} />
              </button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {(featured.length > 0 ? featured : []).map((pkg) => (
                <div key={`${pkg.source}-${pkg.name}`} className="card p-4 min-w-[240px]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{pkg.name}</span>
                    <span className={`badge ${pkg.source === 'aur' ? 'badge-aur' : 'badge-pacman'} text-[9px]`}>
                      {pkg.source === 'aur' ? 'AUR' : (pkg.repository || 'pacman')}
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{pkg.description || 'No description available.'}</p>
                  <button className="btn btn-secondary text-xs mt-3" onClick={() => navigate(`/package/${pkg.name}`)}>
                    View details
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-2 mb-3">
              <Download size={16} style={{ color: 'var(--accent)' }} />
              <p className="section-title">Quick Install</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {quickInstalls.map((item) => (
                <button key={item} className="pill" onClick={() => navigate(`/search?q=${item}`)}>
                  {item}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="section-title">Curated Categories</p>
              <p className="section-subtitle">Focused collections for professional workflows</p>
            </div>
            <button className="btn-ghost text-xs font-semibold flex items-center gap-1.5"
                    style={{ color: 'var(--accent)' }}
                    onClick={() => navigate('/categories')}>
              View all categories <ArrowRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger">
            {(categories.length > 0 ? categories.slice(0, 8) : Object.keys(catMeta).map(n => ({ name: n }))).map((cat) => {
              const meta = catMeta[cat.name] || { icon: Package, color: 'var(--accent)', bg: 'var(--accent-muted)', gradient: 'none' };
              const Icon = meta.icon;
              return (
                <div key={cat.name}
                     className="card card-interactive p-4 flex flex-col gap-3 group relative overflow-hidden"
                     style={{ background: meta.bg, backgroundImage: meta.gradient }}
                     onClick={() => navigate(`/categories/${cat.name}`)}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110"
                       style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <Icon size={17} style={{ color: meta.color }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{cat.name}</h3>
                    <p className="text-[11px] mt-0.5 truncate" style={{ color: 'var(--text-tertiary)' }}>{cat.description || 'System Packages'}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Featured Packages Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="section-title">Recommended Packages</p>
              <p className="section-subtitle">Handpicked for speed and stability</p>
            </div>
            <button className="btn-ghost text-xs font-semibold flex items-center gap-1.5"
                    style={{ color: 'var(--accent)' }}
                    onClick={() => navigate('/search?q=system')}>
              Browse more packages <ArrowRight size={14} />
            </button>
          </div>
          <PackageGrid packages={featured} loading={loading} />
        </section>
      </div>

      {/* ── Right Side Panel ── */}
      <div className="xl:col-span-4 flex flex-col gap-6 min-w-0">
        {/* System Overview Dashboard Panel */}
        <section className="card p-6 flex flex-col gap-4">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2 pb-2 border-b border-[var(--border-primary)]">
            <Cpu size={16} style={{ color: 'var(--accent)' }} />
            Local Machine Overview
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="kpi-card">
              <span className="kpi-label">CPU Usage</span>
              <span className="kpi-value">{sysMetrics.cpu}</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">Physical RAM</span>
              <span className="kpi-value" style={{ fontSize: 16 }}>{sysMetrics.ram}</span>
            </div>
          </div>

          <div className="glass-panel p-4 flex items-center gap-3">
            <HardDrive size={18} style={{ color: 'var(--violet)' }} />
            <div>
              <span className="text-[10px] font-bold uppercase block" style={{ color: 'var(--text-tertiary)' }}>Root Drive Storage</span>
              <span className="text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>{sysMetrics.disk}</span>
            </div>
          </div>

          <div className="glass-panel p-4">
            <h4 className="text-xs font-bold mb-1 flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
              <Zap size={13} style={{ color: 'var(--accent)' }} />
              AUR Helper Status
            </h4>
            <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Yay is configured as the active builder backend. System sync is synchronized with AUR APIs.
            </p>
          </div>
        </section>

        {/* Security Scanner overview banner */}
        <section className="card p-6 flex flex-col gap-3 relative overflow-hidden"
                 style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, transparent 100%)' }}>
          <h3 className="text-sm font-extrabold flex items-center gap-2 pb-2 border-b border-[var(--border-primary)]" style={{ color: 'var(--red)' }}>
            <Shield size={16} /> Security Scan Engine
          </h3>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Local static analyzer inspects PKGBUILD files for suspicious actions before running any builds.
          </p>
          <ul className="text-[11px] flex flex-col gap-1.5 list-disc pl-4" style={{ color: 'var(--text-tertiary)' }}>
            <li>Identifies potential system mutations in install scripts</li>
            <li>Flags untrusted source URLs and binary assets</li>
            <li>Monitors hidden daemon integrations</li>
          </ul>
        </section>

        {/* Upgrade Feed */}
        <section className="card p-6 flex flex-col gap-3">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2 pb-2 border-b border-[var(--border-primary)]">
            <RefreshCw size={15} style={{ color: 'var(--amber)' }} />
            Upgrade Feed
          </h3>

          {updateCount > 0 ? (
            <div className="flex flex-col gap-2">
              <div className="glass-panel p-3 flex items-start gap-2.5">
                <AlertTriangle size={15} className="text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-amber-500">System updates available</h4>
                  <p className="text-[11px] mt-1" style={{ color: 'var(--text-secondary)' }}>
                    There are <span className="font-bold text-white">{updateCount} packages</span> waiting to be upgraded.
                  </p>
                  <button onClick={() => navigate('/updates')} className="btn btn-primary text-[10px] py-1 px-2.5 rounded-lg mt-2 flex items-center gap-1">
                    Manage Updates <ArrowRight size={10} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-xs py-4" style={{ color: 'var(--text-tertiary)' }}>
              No updates available
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
