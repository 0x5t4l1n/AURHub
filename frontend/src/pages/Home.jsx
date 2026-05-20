import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, TrendingUp, Package, ArrowRight, Shield,
  Code, Monitor, Wifi, Music, Gamepad2, LayoutDashboard, Type, ShieldCheck,
  Download, RefreshCw, Zap
} from 'lucide-react';
import api from '../api/client';
import PackageGrid from '../components/PackageGrid';

const catMeta = {
  Development: { icon: Code, color: '#60a5fa', bg: 'rgba(96,165,250,0.08)' },
  System:      { icon: Monitor, color: '#94a3b8', bg: 'rgba(148,163,184,0.08)' },
  Network:     { icon: Wifi, color: '#34d399', bg: 'rgba(52,211,153,0.08)' },
  Multimedia:  { icon: Music, color: '#c084fc', bg: 'rgba(192,132,252,0.08)' },
  Games:       { icon: Gamepad2, color: '#f87171', bg: 'rgba(248,113,113,0.08)' },
  Desktop:     { icon: LayoutDashboard, color: '#818cf8', bg: 'rgba(129,140,248,0.08)' },
  Fonts:       { icon: Type, color: '#fbbf24', bg: 'rgba(251,191,36,0.08)' },
  Security:    { icon: ShieldCheck, color: '#22d3ee', bg: 'rgba(34,211,238,0.08)' },
};

export default function Home() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updateCount, setUpdateCount] = useState(0);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [catRes, featRes, updRes] = await Promise.allSettled([
        api.listCategories(),
        api.searchPackages('firefox chromium vlc', 'all'),
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

  const stats = [
    { icon: Package, label: 'Official', value: 'Pacman', color: 'var(--accent)' },
    { icon: TrendingUp, label: 'AUR', value: '80,000+', color: 'var(--amber)' },
    { icon: Shield, label: 'Security', value: 'Scanner', color: 'var(--green)' },
    { icon: RefreshCw, label: 'Updates', value: updateCount > 0 ? `${updateCount} available` : 'Up to date', color: 'var(--violet)' },
  ];

  return (
    <div className="animate-slide-up flex flex-col gap-5">
      {/* ── Welcome Bar ── */}
      <div className="card p-4 flex flex-col sm:flex-row sm:items-center gap-4"
           style={{ borderColor: 'var(--border-glow)' }}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Zap size={14} style={{ color: 'var(--accent)' }} />
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>
              ArchStore
            </span>
          </div>
          <h1 className="text-lg font-bold leading-tight" style={{ letterSpacing: '-0.02em' }}>
            Discover packages for <span className="gradient-text">Arch Linux</span>
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
            Search official repos and the AUR in one place.
          </p>
        </div>
        <form onSubmit={handleSearch} className="flex gap-2 shrink-0 w-full sm:w-auto sm:max-w-xs">
          <div className="relative flex-1">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              className="input pl-8 pr-3 py-1.5 text-xs rounded-lg"
              placeholder="Search packages..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary px-4 rounded-lg text-xs">
            <Search size={12} /> Go
          </button>
        </form>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="card p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                 style={{ background: `${color}12` }}>
              <Icon size={15} style={{ color }} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold truncate" style={{ color: 'var(--text-primary)' }}>{value}</p>
              <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Categories ── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Categories</h2>
          <button className="btn-ghost text-[11px] font-semibold flex items-center gap-1"
                  style={{ color: 'var(--accent)' }}
                  onClick={() => navigate('/categories')}>
            View all <ArrowRight size={12} />
          </button>
        </div>
        <div className="cat-grid stagger">
          {(categories.length > 0 ? categories : Object.keys(catMeta).map(n => ({ name: n }))).map((cat) => {
            const meta = catMeta[cat.name] || { icon: Package, color: 'var(--accent)', bg: 'var(--accent-muted)' };
            const Icon = meta.icon;
            return (
              <div key={cat.name}
                   className="card card-interactive p-3 group"
                   onClick={() => navigate(`/categories/${cat.name}`)}>
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
                       style={{ background: meta.bg }}>
                    <Icon size={14} style={{ color: meta.color }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{cat.name}</p>
                    <p className="text-[10px] truncate" style={{ color: 'var(--text-tertiary)' }}>
                      {cat.description || 'Explore packages'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Featured Packages ── */}
      {featured.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Popular Packages</h2>
            <button className="btn-ghost text-[11px] font-semibold flex items-center gap-1"
                    style={{ color: 'var(--accent)' }}
                    onClick={() => navigate('/search?q=popular')}>
              See more <ArrowRight size={12} />
            </button>
          </div>
          <PackageGrid packages={featured} loading={loading} />
        </section>
      )}
    </div>
  );
}
