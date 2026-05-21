import { useEffect, useState } from 'react';
import { useTheme } from '../lib/theme';
import { api } from '../lib/api';

export default function SettingsPage() {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';
  const [health, setHealth] = useState<{ status: string; database: string; version: string } | null>(null);
  const [healthLoading, setHealthLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    api.health().then(setHealth).catch(() => setHealth(null)).finally(() => setHealthLoading(false));
  }, []);

  const handleClearCache = async () => {
    setClearing(true);
    try { await api.clearCache(); } catch {} finally { setClearing(false); }
  };

  const panel = `border rounded-sm ${isDark ? 'bg-dark-panel border-dark-border' : 'bg-light-panel border-light-border'}`;
  const sec = isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary';
  const sel = `px-2 py-1.5 text-sm border rounded-sm ${isDark ? 'bg-dark-bg border-dark-border text-dark-text' : 'bg-light-bg border-light-border text-light-text'}`;
  const hdr = `px-3 py-2 border-b text-lg font-medium ${isDark ? 'border-dark-border text-dark-text' : 'border-light-border text-light-text'}`;
  const row = `flex items-center justify-between px-3 py-2.5 border-b last:border-b-0 ${isDark ? 'border-dark-border' : 'border-light-border'}`;
  const btn = `px-3 py-1 text-xs border rounded-sm ${isDark ? 'border-dark-border text-dark-text-secondary hover:bg-dark-hover' : 'border-light-border text-light-text-secondary hover:bg-light-hover'} disabled:opacity-50`;

  return (
    <div className="p-4 space-y-4 overflow-y-auto h-full">
      <h1 className={`text-3xl font-semibold ${isDark ? 'text-dark-text' : 'text-light-text'}`}>Settings</h1>

      <div className={panel}><div className={hdr}>AUR Helper</div>
        <div className={row}><div><div className="text-sm">AUR Helper</div><div className={`text-xs mt-0.5 ${sec}`}>Helper used for AUR packages</div></div>
          <select defaultValue="yay" className={sel}><option value="yay">yay</option><option value="paru">paru</option><option value="trizen">trizen</option></select></div>
        <div className={row}><div><div className="text-sm">Check AUR updates</div></div><input type="checkbox" defaultChecked className="accent-arch-blue" /></div>
      </div>

      <div className={panel}><div className={hdr}>Backend Status</div>
        <div className={row}><div className="text-sm">API Status</div>
          {healthLoading ? <span className={`text-sm ${sec}`}>Checking...</span> : health ? <span className="text-sm text-green-500 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />{health.status}</span> : <span className="text-sm text-red-400">Disconnected</span>}</div>
        <div className={row}><div className="text-sm">Database</div><span className={`text-sm ${sec}`}>{health?.database || 'Unknown'}</span></div>
        <div className={row}><div className="text-sm">API Version</div><span className={`text-sm font-mono ${sec}`}>{health?.version || '—'}</span></div>
      </div>

      <div className={panel}><div className={hdr}>Notifications</div>
        <div className={row}><div><div className="text-sm">Desktop notifications</div><div className={`text-xs mt-0.5 ${sec}`}>Show notifications for updates</div></div><input type="checkbox" defaultChecked className="accent-arch-blue" /></div>
        <div className={row}><div><div className="text-sm">Update check interval</div></div>
          <select className={sel} defaultValue="6h"><option value="1h">Every hour</option><option value="6h">Every 6 hours</option><option value="24h">Daily</option><option value="never">Never</option></select></div>
      </div>

      <div className={panel}><div className={hdr}>Cache</div>
        <div className={row}><div><div className="text-sm">Package cache</div><div className={`text-xs mt-0.5 ${sec}`}>Cached metadata (TTL: 15min)</div></div>
          <button onClick={handleClearCache} disabled={clearing} className={btn}>{clearing ? 'Clearing...' : 'Clear Cache'}</button></div>
      </div>

      <div className={panel}><div className={hdr}>Appearance</div>
        <div className={row}><div><div className="text-sm">Theme</div><div className={`text-xs mt-0.5 ${sec}`}>Current: {theme}</div></div>
          <button onClick={toggle} className={btn}>{isDark ? 'Switch to Light' : 'Switch to Dark'}</button></div>
      </div>

      <div className={panel}><div className={hdr}>About</div>
        <div className={row}><div className="text-sm">ArchStore</div><span className={`text-sm font-mono ${sec}`}>v1.0.0</span></div>
        <div className={row}><div className="text-sm">License</div><span className={`text-sm ${sec}`}>GPL-3.0</span></div>
      </div>
    </div>
  );
}
