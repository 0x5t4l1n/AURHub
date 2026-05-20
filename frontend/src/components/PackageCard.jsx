import { useNavigate } from 'react-router-dom';
import { CheckCircle, AlertTriangle, Star, Download } from 'lucide-react';

export default function PackageCard({ pkg }) {
  const navigate = useNavigate();
  const sourceBadge = pkg.source === 'aur' ? 'badge-aur' : 'badge-pacman';
  const sourceLabel = pkg.source === 'aur' ? 'AUR' : (pkg.repository || 'pacman');

  return (
    <div
      className="card card-interactive package-card p-4 flex flex-col gap-3 cursor-pointer"
      onClick={() => navigate(`/package/${pkg.name}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/package/${pkg.name}`)}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 min-w-0">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[15px] truncate" style={{ color: 'var(--text-primary)' }}>
              {pkg.name}
            </span>
            {pkg.installed && <CheckCircle size={13} style={{ color: 'var(--green)' }} />}
            {pkg.out_of_date && <AlertTriangle size={13} style={{ color: 'var(--amber)' }} />}
          </div>
          <span className="text-[12px] font-mono" style={{ color: 'var(--text-tertiary)' }}>
            {pkg.version || '—'}
          </span>
        </div>
        <span className={`badge ${sourceBadge} shrink-0`}>{sourceLabel}</span>
      </div>

      {/* Description */}
      <p className="text-[13px] leading-relaxed"
         style={{
           color: pkg.description ? 'var(--text-secondary)' : 'var(--text-tertiary)',
           fontStyle: pkg.description ? 'normal' : 'italic',
           display: '-webkit-box',
           WebkitLineClamp: 2,
           WebkitBoxOrient: 'vertical',
           overflow: 'hidden',
           minHeight: '2.4em'
         }}>
        {pkg.description || 'No description available'}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 mt-auto"
           style={{ borderTop: '1px solid var(--border-primary)' }}>
        <div className="flex items-center gap-3 text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
          {pkg.votes !== undefined && pkg.votes > 0 && (
            <span className="flex items-center gap-0.5">
              <Star size={12} style={{ color: 'var(--amber)', fill: 'var(--amber)' }} /> {pkg.votes}
            </span>
          )}
          {pkg.popularity > 0 && <span>{pkg.popularity.toFixed(1)}</span>}
        </div>
        {pkg.installed ? (
          <span className="badge badge-installed text-[10px]">Installed</span>
        ) : (
          <span className="flex items-center gap-1.5 text-[12px] font-semibold"
                style={{ color: 'var(--accent)' }}>
            <Download size={12} /> Install
          </span>
        )}
      </div>
    </div>
  );
}
