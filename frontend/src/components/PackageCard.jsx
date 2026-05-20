import { useNavigate } from 'react-router-dom';
import { CheckCircle, AlertTriangle, Star, ArrowRight } from 'lucide-react';

export default function PackageCard({ pkg }) {
  const navigate = useNavigate();

  const sourceBadge = pkg.source === 'aur' ? 'badge-aur' : 'badge-pacman';
  const sourceLabel = pkg.source === 'aur' ? 'AUR' : (pkg.repository || 'pacman');

  return (
    <div
      className="card card-interactive p-5 flex flex-col gap-3 justify-between"
      onClick={() => navigate(`/package/${pkg.name}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/package/${pkg.name}`)}
    >
      <div className="flex flex-col gap-2">
        {/* Top: Name and badges */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-bold text-sm tracking-tight truncate" style={{ color: 'var(--text-primary)' }}>
                {pkg.name}
              </h3>
              {pkg.installed && <CheckCircle size={13} className="text-emerald-500 shrink-0" />}
              {pkg.out_of_date && <AlertTriangle size={13} className="text-amber-500 shrink-0" />}
            </div>
            <span className="text-[11px] font-mono font-medium" style={{ color: 'var(--text-tertiary)' }}>
              {pkg.version || '—'}
            </span>
          </div>
          <span className={`badge ${sourceBadge} shrink-0`}>{sourceLabel}</span>
        </div>

        {/* Mid: Description */}
        <p className={`text-xs leading-relaxed ${!pkg.description ? 'italic' : ''}`}
           style={{
             color: pkg.description ? 'var(--text-secondary)' : 'var(--text-tertiary)',
             display: '-webkit-box',
             WebkitLineClamp: 2,
             WebkitBoxOrient: 'vertical',
             overflow: 'hidden',
             minHeight: '2.5rem'
           }}>
          {pkg.description || 'No description available'}
        </p>
      </div>

      {/* Bottom: Stats & Action */}
      <div className="flex items-center justify-between pt-3 mt-1"
           style={{ borderTop: '1px solid var(--border-primary)' }}>
        <div className="flex items-center gap-3 text-[11px] font-medium" style={{ color: 'var(--text-tertiary)' }}>
          {pkg.votes !== undefined && pkg.votes > 0 && (
            <span className="flex items-center gap-1">
              <Star size={11} className="fill-amber-400 stroke-amber-400" /> {pkg.votes}
            </span>
          )}
          {pkg.popularity > 0 && (
            <span>Pop: {pkg.popularity.toFixed(1)}</span>
          )}
        </div>
        
        <span className="flex items-center gap-1 text-[11px] font-bold" style={{ color: 'var(--accent)' }}>
          Details <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </div>
  );
}
