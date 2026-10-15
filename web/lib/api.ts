export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const TOKEN_KEY = 'accessToken';

function setCookie(name: string, value: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=${value}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

function clearCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const parts = document.cookie.split(';').map((s) => s.trim());
  for (const p of parts) {
    if (p.startsWith(name + '=')) return decodeURIComponent(p.slice(name.length + 1));
  }
  return null;
}

/** Decode the payload of a JWT without verifying the signature (routing use only). */
export function decodeTokenPayload(token: string): any | null {
  try {
    const seg = token.split('.')[1];
    if (!seg) return null;
    const json = atob(seg.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getRoleFromToken(token: string | null): string | null {
  if (!token) return null;
  const payload = decodeTokenPayload(token);
  return typeof payload?.role === 'string' ? payload.role : null;
}

export function isTokenExpired(token: string | null): boolean {
  if (!token) return true;
  const payload = decodeTokenPayload(token);
  if (!payload || typeof payload.exp !== 'number') return false;
  return payload.exp * 1000 <= Date.now();
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

/** Persist session to both localStorage (apiFetch) and cookie (middleware). */
export function saveSession(accessToken: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, accessToken);
  setCookie(TOKEN_KEY, accessToken);
}

/** Clear session from both localStorage and cookie. */
export function clearSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem('refreshToken');
  clearCookie(TOKEN_KEY);
}

/**
 * Re-sync the middleware-readable cookie when the app loads with a token
 * only in localStorage (e.g. sessions created before the cookie existed).
 */
export function syncSessionFromStorage() {
  if (typeof window === 'undefined') return;
  const t = localStorage.getItem(TOKEN_KEY);
  if (t && !getCookie(TOKEN_KEY)) setCookie(TOKEN_KEY, t);
}

export function authHeaders(){
  if(typeof window==='undefined') return {} as any;
  const t=localStorage.getItem(TOKEN_KEY);
  return t? { Authorization: `Bearer ${t}` } : {};
}

function redirectToLogin() {
  if (typeof window === 'undefined') return;
  clearSession();
  const next = window.location.pathname + window.location.search;
  const safe = next.startsWith('/') && !next.startsWith('//') && !next.includes('://');
  window.location.href = safe && next !== '/login' ? `/login?next=${encodeURIComponent(next)}` : '/login';
}

export async function apiFetch(path:string, opts:any={}){
  const res = await fetch(`${API_URL}${path}`, { ...opts, headers:{ 'Content-Type':'application/json', ...authHeaders(), ...(opts.headers||{}) } });
  const data = await res.json().catch(()=>({}));
  if (res.status === 401) {
    redirectToLogin();
    throw Object.assign(new Error(data.message || 'Unauthorized'), { status: 401, data });
  }
  if(!res.ok) throw Object.assign(new Error(data.message||'Error'), { status: res.status, data });
  return data;
}
