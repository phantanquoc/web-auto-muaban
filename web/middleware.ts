import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function decodePayload(token: string): any | null {
  try {
    const seg = token.split('.')[1];
    if (!seg) return null;
    const json = atob(seg.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function isSafeNext(v: string | null): v is string {
  return !!v && v.startsWith('/') && !v.startsWith('//') && !v.includes('://');
}

function safeNext(req: NextRequest): string | null {
  return isSafeNext(req.nextUrl.searchParams.get('next'))
    ? req.nextUrl.searchParams.get('next')
    : null;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('accessToken')?.value ?? null;
  const payload = token ? decodePayload(token) : null;
  const expired = payload && typeof payload.exp === 'number' ? payload.exp * 1000 <= Date.now() : false;
  const validToken = token && payload && !expired ? token : null;
  const role = validToken ? (typeof payload?.role === 'string' ? payload.role : null) : null;

  const loginUrl = (next?: string) => {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.search = next ? `?next=${encodeURIComponent(next)}` : '';
    return url;
  };
  const homeUrl = (r: string | null) => {
    const url = req.nextUrl.clone();
    url.pathname = r === 'ADMIN' ? '/admin' : '/shop';
    url.search = '';
    return url;
  };

  if (pathname.startsWith('/admin')) {
    if (!validToken) return NextResponse.redirect(loginUrl(pathname));
    if (role !== 'ADMIN') {
      const url = req.nextUrl.clone();
      url.pathname = '/shop';
      url.search = '';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (pathname === '/login') {
    if (validToken) {
      const next = safeNext(req);
      if (next) {
        if (!next.startsWith('/admin') || role === 'ADMIN') {
          const url = req.nextUrl.clone();
          url.pathname = next;
          url.search = '';
          return NextResponse.redirect(url);
        }
      }
      return NextResponse.redirect(homeUrl(role));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
};
