import PackageCard from './PackageCard';
import { PackageOpen } from 'lucide-react';

export default function PackageGrid({ packages, loading }) {
  if (loading) {
    return (
      <div className="pkg-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card p-5 flex flex-col gap-3">
            <div className="flex justify-between">
              <div className="shimmer h-5 w-32"></div>
              <div className="shimmer h-5 w-16 rounded-full"></div>
            </div>
            <div className="shimmer h-3 w-20"></div>
            <div className="shimmer h-4 w-full"></div>
            <div className="shimmer h-4 w-3/4"></div>
            <div className="flex justify-between pt-2" style={{ borderTop: '1px solid var(--border-primary)' }}>
              <div className="shimmer h-3 w-12"></div>
              <div className="shimmer h-3 w-16"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!packages || packages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24" style={{ color: 'var(--text-tertiary)' }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
             style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
          <PackageOpen size={28} />
        </div>
        <p className="text-base font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>No packages found</p>
        <p className="text-sm">Try adjusting your search or filters</p>
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
