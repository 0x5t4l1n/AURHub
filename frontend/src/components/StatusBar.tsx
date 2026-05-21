import { useTheme } from '../lib/theme';

interface StatusBarProps {
  backendStatus: 'connected' | 'disconnected' | 'checking';
  installedCount: number;
  updatesCount: number;
}

export default function StatusBar({ backendStatus, installedCount, updatesCount }: StatusBarProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const statusColor =
    backendStatus === 'connected'
      ? 'bg-green-500'
      : backendStatus === 'checking'
        ? 'bg-yellow-500'
        : 'bg-red-500';

  return (
    <footer
      className={`h-[24px] flex items-center px-3 text-[11px] gap-4 border-t flex-shrink-0 ${
        isDark
          ? 'bg-dark-panel border-dark-border text-dark-text-secondary'
          : 'bg-light-panel border-light-border text-light-text-secondary'
      }`}
    >
      <span className="flex items-center gap-1.5">
        <span className={`inline-block w-2 h-2 rounded-full ${statusColor}`} />
        Backend: {backendStatus}
      </span>

      <span className={`w-px h-3 ${isDark ? 'bg-dark-border' : 'bg-light-border'}`} />

      <span>Installed: {installedCount}</span>

      <span className={`w-px h-3 ${isDark ? 'bg-dark-border' : 'bg-light-border'}`} />

      <span>Updates: {updatesCount}</span>

      <div className="flex-1" />

      <span>ArchStore v1.0.0</span>
    </footer>
  );
}
