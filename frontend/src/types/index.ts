export interface Package {
  name: string;
  description: string;
  version: string;
  repository: string;
  source: 'pacman' | 'aur';
  installed: boolean;
  installed_version?: string;
  url?: string;
  maintainer?: string;
  votes?: number;
  popularity?: number;
  out_of_date?: boolean;
  depends?: string[];
  make_depends?: string[];
  opt_depends?: string[];
  size?: string;
  install_size?: string;
  licenses?: string[];
  groups?: string[];
  build_date?: string;
  install_date?: string;
  packager?: string;
  arch?: string;
  provides?: string[];
  conflicts?: string[];
  replaces?: string[];
}

export interface UpdatePackage {
  name: string;
  current_version: string;
  new_version: string;
  source: 'pacman' | 'aur';
  repository?: string;
}

export interface Category {
  name: string;
  description: string;
  icon: string;
  count: number;
}

export interface SearchResult {
  results: Package[];
  count: number;
  query: string;
  source: string;
}

export interface InstalledResult {
  results: Package[];
  count: number;
}

export interface UpdatesResult {
  results: UpdatePackage[];
  count: number;
  pacman_count: number;
  aur_count: number;
}

export interface CategoriesResult {
  results: Category[];
  count: number;
}

export interface CategoryPackagesResult {
  category: string;
  results: Package[];
  count: number;
}

export interface ScanResult {
  package_name: string;
  risk_score: number;
  findings: ScanFinding[];
  scanned: boolean;
  risk_level: string;
  message?: string;
}

export interface ScanFinding {
  type: string;
  severity: string;
  description: string;
  line?: number;
}

export type ThemeMode = 'dark' | 'light';

export type Page =
  | 'dashboard'
  | 'search'
  | 'installed'
  | 'updates'
  | 'categories'
  | 'settings'
  | 'package-details';
