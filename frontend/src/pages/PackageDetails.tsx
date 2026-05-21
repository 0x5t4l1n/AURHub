import { useEffect, useState } from 'react';
import { ArrowLeft, Download, Trash2, ExternalLink, Shield } from 'lucide-react';
import { useTheme } from '../lib/theme';
import { api } from '../lib/api';
import type { Package, ScanResult } from '../types';

interface PackageDetailsProps {
  packageName: string;
  onBack: () => void;
}

export default function PackageDetails({ packageName, onBack }: PackageDetailsProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [pkg, setPkg] = useState<Package | null>(null);
  const [scan, setScan] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    Promise.all([
      api.getPackageInfo(packageName),
      api.scanPackage(packageName).catch(() => null),
    ])
      .then(([info, scanRes]) => {
        setPkg(info);
        setScan(scanRes);
      })
      .catch(err => setError(err.message || 'Failed to load package'))
      .finally(() => setLoading(false));
  }, [packageName]);

  const handleInstall = async () => {
    setActionLoading(true);
    try {
      await api.installPackage(packageName);
      const info = await api.getPackageInfo(packageName);
      setPkg(info);
    } catch {} finally { setActionLoading(false); }
  };

  const handleRemove = async () => {
    setActionLoading(true);
    try {
      await api.removePackage(packageName);
      const info = await api.getPackageInfo(packageName);
      setPkg(info);
    } catch {} finally { setActionLoading(false); }
  };

  const panel = `border rounded-sm ${isDark ? 'bg-dark-panel border-dark-border' : 'bg-light-panel border-light-border'}`;
  const sec = isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary';
  const row = `flex justify-between px-3 py-1.5 border-b last:border-b-0 text-sm ${isDark ? 'border-dark-border' : 'border-light-border'}`;

  if (loading) return (
    <div className="p-4">
      <button onClick={onBack} className={`flex items-center gap-1 text-sm mb-4 ${sec} hover:text-arch-blue`}>
        <ArrowLeft size={14} /> Back
      </button>
      <p className={`text-sm ${sec}`}>Loading package information...</p>
    </div>
  );

  if (error || !pkg) return (
    <div className="p-4">
      <button onClick={onBack} className={`flex items-center gap-1 text-sm mb-4 ${sec} hover:text-arch-blue`}>
        <ArrowLeft size={14} /> Back
      </button>
      <div className="px-3 py-2 text-sm border border-red-800 bg-red-900/20 text-red-400 rounded-sm">
        {error || 'Package not found'}
      </div>
    </div>
  );

  const ensureArray = (val: any): string[] => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') {
      return val.split(/[\s,]+/).filter(Boolean);
    }
    return [];
  };

  const parsedLicenses = ensureArray(pkg.licenses);
  const parsedDepends = ensureArray(pkg.depends);
  const parsedOptDepends = ensureArray(pkg.opt_depends);

  return (
    <div className="p-4 space-y-4 overflow-y-auto h-full">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className={`flex items-center gap-1 text-sm ${sec} hover:text-arch-blue`}>
          <ArrowLeft size={14} /> Back
        </button>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className={`text-3xl font-semibold ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
            {pkg.name}
          </h1>
          <p className={`text-sm mt-1 ${sec}`}>{pkg.description}</p>
        </div>
        <div className="flex gap-2">
          {pkg.installed ? (
            <button onClick={handleRemove} disabled={actionLoading}
              className="px-3 py-1.5 text-sm border border-red-700 text-red-400 rounded-sm hover:bg-red-900/20 disabled:opacity-50 flex items-center gap-1.5">
              <Trash2 size={14} /> {actionLoading ? 'Removing...' : 'Remove'}
            </button>
          ) : (
            <button onClick={handleInstall} disabled={actionLoading}
              className="px-3 py-1.5 text-sm bg-arch-blue text-white rounded-sm hover:bg-arch-blue-hover disabled:opacity-50 flex items-center gap-1.5">
              <Download size={14} /> {actionLoading ? 'Installing...' : 'Install'}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Package Info */}
        <div className={panel}>
          <div className={`px-3 py-2 border-b font-medium text-sm ${isDark ? 'border-dark-border' : 'border-light-border'}`}>
            Package Information
          </div>
          <div className={row}><span className={sec}>Version</span><span className="font-mono text-xs">{pkg.version}</span></div>
          <div className={row}><span className={sec}>Source</span>
            <span className={`text-xs px-1.5 py-0.5 rounded-sm ${pkg.source === 'aur' ? 'bg-arch-blue-light text-arch-blue' : isDark ? 'bg-dark-active text-dark-text-secondary' : 'bg-light-active text-light-text-secondary'}`}>
              {pkg.source === 'aur' ? 'AUR' : pkg.repository || 'pacman'}
            </span>
          </div>
          <div className={row}><span className={sec}>Status</span>
            {pkg.installed ? <span className="text-green-500 text-xs">Installed</span> : <span className={`text-xs ${sec}`}>Not installed</span>}
          </div>
          {pkg.installed_version && <div className={row}><span className={sec}>Installed Version</span><span className="font-mono text-xs">{pkg.installed_version}</span></div>}
          {pkg.arch && <div className={row}><span className={sec}>Architecture</span><span className="text-xs">{pkg.arch}</span></div>}
          {parsedLicenses.length > 0 && <div className={row}><span className={sec}>License</span><span className="text-xs">{parsedLicenses.join(', ')}</span></div>}
          {pkg.size && <div className={row}><span className={sec}>Download Size</span><span className="text-xs">{pkg.size}</span></div>}
          {pkg.install_size && <div className={row}><span className={sec}>Installed Size</span><span className="text-xs">{pkg.install_size}</span></div>}
          {pkg.packager && <div className={row}><span className={sec}>Packager</span><span className="text-xs truncate max-w-[200px]">{pkg.packager}</span></div>}
          {pkg.build_date && <div className={row}><span className={sec}>Build Date</span><span className="text-xs">{pkg.build_date}</span></div>}
          {pkg.url && (
            <div className={row}><span className={sec}>URL</span>
              <a href={pkg.url} target="_blank" rel="noreferrer" className="text-xs text-arch-blue hover:underline flex items-center gap-1">
                {pkg.url.replace(/^https?:\/\//, '').slice(0, 40)} <ExternalLink size={10} />
              </a>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Dependencies */}
          {parsedDepends.length > 0 && (
            <div className={panel}>
              <div className={`px-3 py-2 border-b font-medium text-sm ${isDark ? 'border-dark-border' : 'border-light-border'}`}>
                Dependencies ({parsedDepends.length})
              </div>
              <div className="p-3 flex flex-wrap gap-1">
                {parsedDepends.map(dep => (
                  <span key={dep} className={`text-xs px-1.5 py-0.5 rounded-sm ${isDark ? 'bg-dark-active text-dark-text-secondary' : 'bg-light-active text-light-text-secondary'}`}>
                    {dep}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Optional deps */}
          {parsedOptDepends.length > 0 && (
            <div className={panel}>
              <div className={`px-3 py-2 border-b font-medium text-sm ${isDark ? 'border-dark-border' : 'border-light-border'}`}>
                Optional Dependencies ({parsedOptDepends.length})
              </div>
              <div className="p-3 flex flex-wrap gap-1">
                {parsedOptDepends.map(dep => (
                  <span key={dep} className={`text-xs px-1.5 py-0.5 rounded-sm ${isDark ? 'bg-dark-active text-dark-text-secondary' : 'bg-light-active text-light-text-secondary'}`}>
                    {dep}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Security scan */}
          {scan && scan.scanned && (
            <div className={panel}>
              <div className={`px-3 py-2 border-b font-medium text-sm flex items-center gap-1.5 ${isDark ? 'border-dark-border' : 'border-light-border'}`}>
                <Shield size={14} className="text-arch-blue" /> Security Scan
              </div>
              <div className={row}>
                <span className={sec}>Risk Level</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-sm font-medium ${
                  scan.risk_level === 'low' ? 'bg-green-900/30 text-green-400'
                    : scan.risk_level === 'medium' ? 'bg-yellow-900/30 text-yellow-400'
                      : 'bg-red-900/30 text-red-400'
                }`}>{scan.risk_level}</span>
              </div>
              <div className={row}><span className={sec}>Risk Score</span><span className="text-xs">{scan.risk_score}/100</span></div>
              {scan.findings.length > 0 && (
                <div className="p-3">
                  <p className={`text-xs font-medium mb-1 ${sec}`}>Findings:</p>
                  {scan.findings.map((f, i) => (
                    <div key={i} className={`text-xs py-1 border-t ${isDark ? 'border-dark-border' : 'border-light-border'}`}>
                      <span className={`font-medium ${f.severity === 'high' ? 'text-red-400' : f.severity === 'medium' ? 'text-yellow-400' : 'text-green-400'}`}>
                        [{f.severity}]
                      </span>{' '}
                      {f.description}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
