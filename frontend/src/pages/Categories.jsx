import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import PackageGrid from '../components/PackageGrid';
import {
  Code, Monitor, Wifi, Music, Gamepad2, LayoutDashboard, Type, ShieldCheck,
  ArrowLeft, Package
} from 'lucide-react';

const catMeta = {
  Development: { icon: Code, color: '#60a5fa', bg: 'rgba(96,165,250,0.08)', desc: 'Programming tools, compilers, and IDEs' },
  System:      { icon: Monitor, color: '#94a3b8', bg: 'rgba(148,163,184,0.08)', desc: 'Core system utilities and tools' },
  Network:     { icon: Wifi, color: '#34d399', bg: 'rgba(52,211,153,0.08)', desc: 'Networking tools, browsers, and servers' },
  Multimedia:  { icon: Music, color: '#c084fc', bg: 'rgba(192,132,252,0.08)', desc: 'Audio, video, and image tools' },
  Games:       { icon: Gamepad2, color: '#f87171', bg: 'rgba(248,113,113,0.08)', desc: 'Games and gaming tools' },
  Desktop:     { icon: LayoutDashboard, color: '#818cf8', bg: 'rgba(129,140,248,0.08)', desc: 'Desktop environments and window managers' },
  Fonts:       { icon: Type, color: '#fbbf24', bg: 'rgba(251,191,36,0.08)', desc: 'Fonts and typography' },
  Security:    { icon: ShieldCheck, color: '#22d3ee', bg: 'rgba(34,211,238,0.08)', desc: 'Security and privacy tools' },
};

export default function Categories() {
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (categoryName) loadPkgs(categoryName);
    else loadCats();
  }, [categoryName]);

  async function loadCats() {
    setLoading(true); setError(null);
    try { const d = await api.listCategories(); setCategories(d.results || []); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function loadPkgs(name) {
    setLoading(true); setError(null);
    try { const d = await api.getCategoryPackages(name); setPackages(d.results || []); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  /* ── Category detail view ── */
  if (categoryName) {
    const meta = catMeta[categoryName] || { icon: Package, color: 'var(--accent)', bg: 'var(--accent-muted)' };
    const Icon = meta.icon;
    return (
      <div className="animate-slide-up flex flex-col gap-6">
        <button onClick={() => navigate('/categories')} className="btn btn-secondary w-fit text-xs">
          <ArrowLeft size={12} /> Back
        </button>
        <div className="card p-6 flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
               style={{ background: meta.bg, border: '1px solid var(--border-primary)' }}>
            <Icon size={22} style={{ color: meta.color }} />
          </div>
          <div className="flex-1">
            <h1 className="page-title">{categoryName}</h1>
            <p className="page-subtitle">Browse popular {categoryName.toLowerCase()} packages</p>
          </div>
          <div className="pill">{packages.length} packages</div>
        </div>
        {error && <div className="rounded-lg p-3 text-xs" style={{ background: 'var(--red-muted)', color: 'var(--red)' }}>{error}</div>}
        <PackageGrid packages={packages} loading={loading} />
      </div>
    );
  }

  /* ── Category list view ── */
  return (
    <div className="animate-slide-up flex flex-col gap-6">
      <div>
        <h1 className="page-title">Categories</h1>
        <p className="page-subtitle">Explore software by type</p>
      </div>

      {error && <div className="rounded-lg p-3 text-xs" style={{ background: 'var(--red-muted)', color: 'var(--red)' }}>{error}</div>}

      {loading ? (
        <div className="cat-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card p-4">
              <div className="flex items-center gap-3">
                <div className="shimmer w-10 h-10 rounded-xl"></div>
                <div className="flex-1">
                  <div className="shimmer h-3 w-28 mb-2"></div>
                  <div className="shimmer h-2.5 w-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger">
          {(categories.length > 0 ? categories : Object.keys(catMeta).map(n => ({ name: n }))).map((cat) => {
            const meta = catMeta[cat.name] || { icon: Package, color: 'var(--accent)', bg: 'var(--accent-muted)', desc: 'Explore packages' };
            const Icon = meta.icon;
            return (
              <div key={cat.name}
                   className="card card-interactive p-5 group"
                   onClick={() => navigate(`/categories/${cat.name}`)}>
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
                       style={{ background: meta.bg, border: '1px solid rgba(255,255,255,0.05)' }}>
                    <Icon size={18} style={{ color: meta.color }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{cat.name}</p>
                    <p className="text-[11px] leading-snug" style={{ color: 'var(--text-tertiary)' }}>
                      {cat.description || meta.desc}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
