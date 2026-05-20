/**
 * ArchStore API Client
 * Handles all communication with the FastAPI backend.
 */

const BASE_URL = '/api';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const config = {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(error.detail || `Request failed: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    if (error.message === 'Failed to fetch') {
      throw new Error('Cannot connect to ArchStore backend. Is the server running?');
    }
    throw error;
  }
}

export const api = {
  // Package operations
  searchPackages: (query, source = 'all') =>
    request(`/packages/search?q=${encodeURIComponent(query)}&source=${source}`),

  getPackageInfo: (name) =>
    request(`/packages/${encodeURIComponent(name)}`),

  scanPackage: (name) =>
    request(`/packages/${encodeURIComponent(name)}/scan`),

  installPackage: (name) =>
    request(`/packages/${encodeURIComponent(name)}/install`, { method: 'POST' }),

  removePackage: (name) =>
    request(`/packages/${encodeURIComponent(name)}/remove`, { method: 'POST' }),

  listInstalled: () =>
    request('/packages/installed'),

  // Updates
  checkUpdates: () =>
    request('/updates/check'),

  applyUpdates: () =>
    request('/updates/apply', { method: 'POST' }),

  // Categories
  listCategories: () =>
    request('/categories'),

  getCategoryPackages: (name) =>
    request(`/categories/${encodeURIComponent(name)}`),

  // System
  clearCache: () =>
    request('/cache/clear', { method: 'POST' }),

  healthCheck: () =>
    request('/health'),
};

export default api;
