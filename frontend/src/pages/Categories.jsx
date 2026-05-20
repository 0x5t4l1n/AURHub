import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import PackageGrid from '../components/PackageGrid';
import {
  Code, Monitor, Wifi, Music, Gamepad2, LayoutDashboard, Type, ShieldCheck,
  ArrowLeft, Package
} from 'lucide-react';

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

  if (categoryName) {
    const meta = catMeta[categoryName] || { icon: Package, color: 'var(--accent)', bg: 'var(--accent-muted)' };
    const Icon = meta.icon;
    return (
      <div className="animate-slide-up">
        <button onClick={() => navigate('/categories')} className="btn btn-secondary mb-6">
          <ArrowLeft size={15} /> Back
        </button>
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
               style={{ background: meta.bg, border: '1px solid var(--border-primary)' }}>
            <Icon size={26} style={{ color: meta.color }} />
          </div>
          <div>
            <h1 className="page-title">{categoryName}</h1>
            <p className="page-subtitle">Browse popular {categoryName.toLowerCase()} packages</p>
          </div>
        </div>
        {error && <div className="rounded-xl p-4 mb-6 text-sm" style={{ background: 'var(--red-muted)', color: 'var(--red)' }}>{error}</div>}
        <PackageGrid packages={packages} loading={loading} />
      </div>
    );
  }

  return (
    <div className="animate-slide-up">
      <div className="mb-8">
        <h1 className="page-title">Categories</h1>
        <p className="page-subtitle">Explore software by type</p>
      </div>

      {error && <div className="rounded-xl p-4 mb-6 text-sm" style={{ background: 'var(--red-muted)', color: 'var(--red)' }}>{error}</div>}

      {loading ? (
        <div className="cat-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card p-5">
              <div className="shimmer h-11 w-11 rounded-xl mb-4"></div>
              <div className="shimmer h-4 w-24 mb-2"></div>
              <div className="shimmer h-3 w-full"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="cat-grid stagger">
          {categories.map((cat) => {
            const meta = catMeta[cat.name] || { icon: Package, color: 'var(--accent)', bg: 'var(--accent-muted)' };
            const Icon = meta.icon;
            return (
              <div key={cat.name}
                   className="card card-interactive p-6 group"
                   onClick={() => navigate(`/categories/${cat.name}`)}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                     style={{ background: meta.bg }}>
                  <Icon size={22} style={{ color: meta.color }} />
                </div>
                <h3 className="font-semibold text-sm mb-1 transition-colors" style={{ color: 'var(--text-primary)' }}>
                  {cat.name}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
                  {cat.description || 'Explore packages'}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
