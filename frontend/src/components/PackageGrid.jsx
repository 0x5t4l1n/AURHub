import PackageCard from './PackageCard';
import { PackageOpen } from 'lucide-react';

export default function PackageGrid({ packages, loading }) {
  if (loading) {
    return (
      <div className="pkg-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card p-3 flex flex-col gap-2">
            <div className="flex justify-between">
              <div className="shimmer h-4 w-28"></div>
              <div className="shimmer h-4 w-12 rounded-full"></div>
            </div>
            <div className="shimmer h-3 w-16"></div>
            <div className="shimmer h-3 w-full"></div>
            <div className="shimmer h-3 w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!packages || packages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12" style={{ color: 'var(--text-tertiary)' }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
             style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
          <PackageOpen size={20} />
        </div>
        <p className="text-sm font-medium mb-0.5" style={{ color: 'var(--text-secondary)' }}>No packages found</p>
        <p className="text-xs">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="pkg-grid stagger">
      {packages.map((pkg) => (
        <PackageCard key={`${pkg.source}-${pkg.name}`} pkg={pkg} />
      ))}
    </div>
  );
}
