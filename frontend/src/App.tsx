import { useState, useEffect } from 'react';
import { useTheme } from './lib/theme';
import { api } from './lib/api';
import Sidebar from './components/Sidebar';
import Toolbar from './components/Toolbar';
import StatusBar from './components/StatusBar';
import Dashboard from './pages/Dashboard';
import SearchPage from './pages/Search';
import Installed from './pages/Installed';
import Updates from './pages/Updates';
import Categories from './pages/Categories';
import SettingsPage from './pages/Settings';
import PackageDetails from './pages/PackageDetails';
import type { Page } from './types';

export default function App() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [previousPage, setPreviousPage] = useState<Page>('dashboard');
  const [backendStatus, setBackendStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [installedCount, setInstalledCount] = useState(0);
  const [updatesCount, setUpdatesCount] = useState(0);

  useEffect(() => {
    // Check backend health
    api.health()
      .then(() => setBackendStatus('connected'))
      .catch(() => setBackendStatus('disconnected'));

    // Get installed count
    api.listInstalled()
      .then(data => setInstalledCount(data.count))
      .catch(() => {});

    // Get updates count
    api.checkUpdates()
      .then(data => setUpdatesCount(data.count))
      .catch(() => {});
  }, []);

  const navigate = (page: Page) => {
    setSelectedPackage(null);
    setActivePage(page);
  };

  const selectPackage = (name: string) => {
    setPreviousPage(activePage);
    setSelectedPackage(name);
    setActivePage('package-details');
  };

  const goBack = () => {
    setSelectedPackage(null);
    setActivePage(previousPage);
  };

  const handleSync = () => {
    setBackendStatus('checking');
    api.health()
      .then(() => setBackendStatus('connected'))
      .catch(() => setBackendStatus('disconnected'));
    api.checkUpdates()
      .then(data => setUpdatesCount(data.count))
      .catch(() => {});
  };

  const renderPage = () => {
    if (activePage === 'package-details' && selectedPackage) {
      return <PackageDetails packageName={selectedPackage} onBack={goBack} />;
    }
    switch (activePage) {
      case 'dashboard':
        return <Dashboard onNavigate={navigate} onSelectPackage={selectPackage} />;
      case 'search':
        return <SearchPage onSelectPackage={selectPackage} />;
      case 'installed':
        return <Installed onSelectPackage={selectPackage} />;
      case 'updates':
        return <Updates onSelectPackage={selectPackage} onUpdatesLoaded={setUpdatesCount} />;
      case 'categories':
        return <Categories onSelectPackage={selectPackage} />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard onNavigate={navigate} onSelectPackage={selectPackage} />;
    }
  };

  return (
    <div className={`h-screen flex flex-col ${isDark ? 'bg-dark-bg text-dark-text' : 'bg-light-bg text-light-text'}`}>
      <div className="flex flex-1 min-h-0">
        <Sidebar activePage={activePage} onNavigate={navigate} />
        <div className="flex-1 flex flex-col min-w-0">
          <Toolbar onNavigate={navigate} onSync={handleSync} updatesCount={updatesCount} />
          <main className="flex-1 min-h-0 overflow-hidden">
            {renderPage()}
          </main>
        </div>
      </div>
      <StatusBar
        backendStatus={backendStatus}
        installedCount={installedCount}
        updatesCount={updatesCount}
      />
    </div>
  );
}
