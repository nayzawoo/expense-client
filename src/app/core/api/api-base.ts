import { environment } from '../../../environments/environment';

/** Absolute or same-origin API root without trailing slash (includes `/api/v1` segment when composing). */
export function apiUrl(path: string): string {
  const base = environment.apiBaseUrl.replace(/\/$/, '');
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}

export function apiV1(path: string): string {
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return apiUrl(`/api/v1${suffix}`);
}
