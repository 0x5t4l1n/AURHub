import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Search from './pages/Search';
import Installed from './pages/Installed';
import Updates from './pages/Updates';
import Categories from './pages/Categories';
import Settings from './pages/Settings';
import PackageView from './pages/PackageView';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="search" element={<Search />} />
          <Route path="installed" element={<Installed />} />
          <Route path="updates" element={<Updates />} />
          <Route path="categories" element={<Categories />} />
          <Route path="categories/:categoryName" element={<Categories />} />
          <Route path="settings" element={<Settings />} />
          <Route path="package/:packageName" element={<PackageView />} />
        </Route>
      </Routes>
    </Router>
  );
}
