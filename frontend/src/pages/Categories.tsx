import { useEffect, useState } from 'react';
import {
  Code2,
  Cpu,
  Globe,
  Music,
  Gamepad2,
  Monitor,
  Type,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { useTheme } from '../lib/theme';
import { api } from '../lib/api';
import type { Package } from '../types';

interface CategoriesProps {
  onSelectPackage: (name: string) => void;
}

const categoryIcons: Record<string, typeof Code2> = {
  Development: Code2,
  System: Cpu,
  Network: Globe,
  Multimedia: Music,
  Games: Gamepad2,
  Desktop: Monitor,
  Fonts: Type,
  Security: ShieldCheck,
};

const defaultCategories = [
  { name: 'Development', description: 'Programming tools, compilers, IDEs, and libraries' },
  { name: 'System', description: 'System utilities, shells, and administration tools' },
  { name: 'Network', description: 'Network tools, browsers, and communication' },
  { name: 'Multimedia', description: 'Audio, video, and image applications' },
  { name: 'Games', description: 'Games and entertainment software' },
  { name: 'Desktop', description: 'Desktop environments, window managers, and themes' },
  { name: 'Fonts', description: 'Font packages and typefaces' },
  { name: 'Security', description: 'Security tools, encryption, and firewalls' },
];

export default function Categories({ onSelectPackage }: CategoriesProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeCategory) {
      setLoading(true);
      api.getCategoryPackages(activeCategory)
        .then(data => setPackages(data.results))
        .catch(() => setPackages([]))
        .finally(() => setLoading(false));
    }
  }, [activeCategory]);

  const panelClass = `border rounded-sm ${
    isDark ? 'bg-dark-panel border-dark-border' : 'bg-light-panel border-light-border'
  }`;
  const secondaryText = isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary';

  return (
    <div className="p-4 space-y-4 overflow-y-auto h-full">
      <h1 className={`text-3xl font-semibold ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
        Categories
      </h1>

      {/* Category grid */}
      <div className="grid grid-cols-4 gap-3">
        {defaultCategories.map(cat => {
          const Icon = categoryIcons[cat.name] || Code2;
          const active = activeCategory === cat.name;
          return (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(active ? null : cat.name)}
              className={`flex items-start gap-3 p-3 text-left border rounded-sm ${
                active
                  ? 'border-arch-blue bg-arch-blue-light'
                  : isDark
                    ? 'border-dark-border hover:bg-dark-hover bg-dark-panel'
                    : 'border-light-border hover:bg-light-hover bg-light-panel'
              }`}
            >
              <Icon size={20} className={active ? 'text-arch-blue' : secondaryText} />
              <div>
                <div className={`text-sm font-medium ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                  {cat.name}
                </div>
                <div className={`text-xs mt-0.5 ${secondaryText}`}>
                  {cat.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Category packages */}
      {activeCategory && (
        <div className={panelClass}>
          <div className={`px-3 py-2 border-b flex items-center gap-1.5 ${isDark ? 'border-dark-border' : 'border-light-border'}`}>
            <ChevronRight size={14} className="text-arch-blue" />
            <span className={`text-sm font-medium ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
              {activeCategory}
            </span>
            <span className={`text-xs ${secondaryText}`}>
              ({packages.length} packages)
            </span>
          </div>

          {loading ? (
            <div className={`p-4 text-sm ${secondaryText}`}>Loading packages...</div>
          ) : packages.length === 0 ? (
            <div className={`p-4 text-sm text-center ${secondaryText}`}>
              No packages found in this category.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className={`text-left text-xs ${secondaryText}`}>
                  <th className="px-3 py-1.5 font-medium">Package</th>
                  <th className="px-3 py-1.5 font-medium">Description</th>
                  <th className="px-3 py-1.5 font-medium">Version</th>
                  <th className="px-3 py-1.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {packages.map(pkg => (
                  <tr
                    key={pkg.name}
                    className={`border-t cursor-pointer ${
                      isDark
                        ? 'border-dark-border hover:bg-dark-hover'
                        : 'border-light-border hover:bg-light-hover'
                    }`}
                    onClick={() => onSelectPackage(pkg.name)}
                  >
                    <td className="px-3 py-1.5 text-arch-blue font-medium">{pkg.name}</td>
                    <td className={`px-3 py-1.5 ${secondaryText} max-w-[350px] truncate`}>
                      {pkg.description}
                    </td>
                    <td className={`px-3 py-1.5 text-xs font-mono ${secondaryText}`}>
                      {pkg.version}
                    </td>
                    <td className="px-3 py-1.5">
                      {pkg.installed ? (
                        <span className="text-xs text-green-500">Installed</span>
                      ) : (
                        <span className={`text-xs ${secondaryText}`}>Available</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
