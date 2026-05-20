import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, TrendingUp, Package, ArrowRight, Sparkles, Shield,
  Code, Monitor, Wifi, Music, Gamepad2, LayoutDashboard, Type, ShieldCheck
} from 'lucide-react';
import api from '../api/client';
import PackageGrid from '../components/PackageGrid';

const catMeta = {
  Development: { icon: Code, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  System:      { icon: Monitor, color: '#64748b', bg: 'rgba(100,116,139,0.1)' },
  Network:     { icon: Wifi, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  Multimedia:  { icon: Music, color: '#a855f7', bg: 'rgba(168,85,247,0.1)' },
  Games:       { icon: Gamepad2, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  Desktop:     { icon: LayoutDashboard, color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
  Fonts:       { icon: Type, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  Security:    { icon: ShieldCheck, color: '#06b6d4', bg: 'rgba(6,182,212,0.1)' },
};

export default function Home() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [catRes, featRes] = await Promise.allSettled([
        api.listCategories(),
        api.searchPackages('firefox chromium vlc', 'all'),
      ]);
      if (catRes.status === 'fulfilled') setCategories(catRes.value.results || []);
      if (featRes.status === 'fulfilled') setFeatured((featRes.value.results || []).slice(0, 6));
    } catch { /* silent */ }
    finally { setLoading(false); }
  }

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className="animate-slide-up">
      {/* ════════════════ Hero ════════════════ */}
      <section className="relative rounded-2xl overflow-hidden mb-12 p-10 md:p-14"
               style={{
                 background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
                 border: '1px solid var(--border-primary)'
               }}>
        {/* Decorative blobs */}
        <div className="glow-ring" style={{ width: 300, height: 300, top: -100, right: -60 }}></div>
        <div className="glow-ring" style={{ width: 200, height: 200, bottom: -80, left: -40, background: 'var(--violet)' }}></div>

        <div className="relative z-10 max-w-xl">
          <div className="flex items-center gap-2 mb-5">
            <Sparkles size={16} style={{ color: 'var(--accent)' }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>
              Welcome to ArchStore
            </span>
          </div>

          <h1 className="text-3xl md:text-[2.5rem] font-extrabold leading-tight mb-4"
              style={{ letterSpacing: '-0.03em' }}>
            Discover packages for{' '}
            <span className="gradient-text">Arch Linux</span>
          </h1>

          <p className="text-base leading-relaxed mb-8" style={{ color: 'var(--text-secondary)' }}>
            Browse, install, and manage software from official pacman repositories
            and the AUR — all in one beautiful interface.
          </p>

          <form onSubmit={handleSearch} className="flex gap-3 max-w-md">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
              <input
                id="hero-search"
                type="text"
                className="input pl-11 py-3 rounded-xl"
                placeholder="Search packages..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary px-6 rounded-xl">
              <Search size={16} />
              <span className="hidden sm:inline">Search</span>
            </button>
          </form>
        </div>
      </section>

      {/* ════════════════ Stats ════════════════ */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {[
          { icon: Package, label: 'Pacman Repos', value: 'Official', color: 'var(--accent)' },
          { icon: TrendingUp, label: 'AUR Packages', value: '80,000+', color: 'var(--amber)' },
          { icon: Shield, label: 'Security Scan', value: 'Built-in', color: 'var(--green)' },
          { icon: Sparkles, label: 'Updates', value: 'Real-time', color: 'var(--violet)' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="card p-5 text-center">
            <Icon size={20} style={{ color, margin: '0 auto 8px' }} />
            <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{value}</p>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{label}</p>
          </div>
        ))}
      </section>

      {/* ════════════════ Categories ════════════════ */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Browse Categories</h2>
          <button className="btn-ghost text-xs font-semibold flex items-center gap-1"
                  style={{ color: 'var(--accent)' }}
                  onClick={() => navigate('/categories')}>
            View all <ArrowRight size={14} />
          </button>
        </div>

        <div className="cat-grid stagger">
          {(categories.length > 0 ? categories : Object.keys(catMeta).map(n => ({ name: n }))).map((cat) => {
            const meta = catMeta[cat.name] || { icon: Package, color: 'var(--accent)', bg: 'var(--accent-muted)' };
            const Icon = meta.icon;
            return (
              <div key={cat.name}
                   className="card card-interactive p-5 group"
                   onClick={() => navigate(`/categories/${cat.name}`)}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
                     style={{ background: meta.bg }}>
                  <Icon size={20} style={{ color: meta.color }} />
                </div>
                <h3 className="font-semibold text-sm mb-0.5" style={{ color: 'var(--text-primary)' }}>{cat.name}</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
                  {cat.description || 'Explore packages'}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ════════════════ Featured ════════════════ */}
      {featured.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Popular Packages</h2>
            <button className="btn-ghost text-xs font-semibold flex items-center gap-1"
                    style={{ color: 'var(--accent)' }}
                    onClick={() => navigate('/search?q=popular')}>
              See more <ArrowRight size={14} />
            </button>
          </div>
          <PackageGrid packages={featured} loading={loading} />
        </section>
      )}
    </div>
  );
}
