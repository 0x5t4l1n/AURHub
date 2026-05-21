import type {
  SearchResult,
  InstalledResult,
  UpdatesResult,
  CategoriesResult,
  CategoryPackagesResult,
  Package,
  ScanResult,
} from '../types';

const BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Request failed');
  }
  return res.json();
}

export const api = {
  // Packages
  searchPackages: (query: string, source = 'all') =>
    request<SearchResult>(`/packages/search?q=${encodeURIComponent(query)}&source=${source}`),

  getPackageInfo: (name: string) =>
    request<Package>(`/packages/${encodeURIComponent(name)}`),

  listInstalled: () =>
    request<InstalledResult>('/packages/installed'),

  installPackage: (name: string) =>
    request<{ success: boolean; message: string }>(`/packages/${encodeURIComponent(name)}/install`, { method: 'POST' }),

  removePackage: (name: string) =>
    request<{ success: boolean; message: string }>(`/packages/${encodeURIComponent(name)}/remove`, { method: 'POST' }),

  scanPackage: (name: string) =>
    request<ScanResult>(`/packages/${encodeURIComponent(name)}/scan`),

  // Updates
  checkUpdates: () =>
    request<UpdatesResult>('/updates/check'),

  applyUpdates: () =>
    request<{ success: boolean; message: string }>('/updates/apply', { method: 'POST' }),

  // Categories
  listCategories: () =>
    request<CategoriesResult>('/categories'),

  getCategoryPackages: (name: string) =>
    request<CategoryPackagesResult>(`/categories/${encodeURIComponent(name)}`),

  // Health
  health: () =>
    request<{ status: string; database: string; version: string }>('/health'),

  // Cache
  clearCache: () =>
    request<{ status: string; message: string }>('/cache/clear', { method: 'POST' }),
};
