import { useNavigate } from 'react-router-dom';
import { CheckCircle, AlertTriangle, Star, ArrowDownToLine } from 'lucide-react';

export default function PackageCard({ pkg }) {
  const navigate = useNavigate();

  const sourceBadge = pkg.source === 'aur' ? 'badge-aur' : 'badge-pacman';
  const sourceLabel = pkg.source === 'aur' ? 'AUR' : (pkg.repository || 'pacman');

  return (
    <div
      className="card card-interactive p-5 flex flex-col gap-3"
      onClick={() => navigate(`/package/${pkg.name}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/package/${pkg.name}`)}
    >
      {/* Top row: name + badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold truncate" style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>
              {pkg.name}
            </h3>
            {pkg.installed && <CheckCircle size={14} style={{ color: 'var(--green)', flexShrink: 0 }} />}
            {pkg.out_of_date && <AlertTriangle size={14} style={{ color: 'var(--amber)', flexShrink: 0 }} />}
          </div>
          <span className="text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>
            {pkg.version || '—'}
          </span>
        </div>
        <span className={`badge ${sourceBadge}`}>{sourceLabel}</span>
      </div>

      {/* Description */}
      <p className="text-sm leading-relaxed flex-1"
         style={{ color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {pkg.description || 'No description available'}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1"
           style={{ borderTop: '1px solid var(--border-primary)', marginTop: 'auto' }}>
        <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-tertiary)' }}>
          {pkg.votes !== undefined && (
            <span className="flex items-center gap-1">
              <Star size={12} /> {pkg.votes}
            </span>
          )}
          {pkg.popularity > 0 && (
            <span>{pkg.popularity.toFixed(2)}</span>
          )}
        </div>
        {pkg.installed ? (
          <span className="badge badge-installed">Installed</span>
        ) : (
          <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: 'var(--accent)' }}>
            <ArrowDownToLine size={13} /> Get
          </span>
        )}
      </div>
    </div>
  );
}
