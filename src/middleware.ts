import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Routes that are never country-prefixed — don't validate or redirect these
const GLOBAL_ROUTES = new Set([
  '', 'login', 'signup', 'dashboard', 'create-expert-account',
  'for-experts', 'pricing', 'founding-experts', 'search', 'verify',
  'api', '_next', 'favicon.ico',
]);

// Mapping from Vercel/Cloudflare geo country codes → our supported country slugs
const GEO_TO_COUNTRY: Record<string, string> = {
  BD: 'bd', AE: 'ae', SA: 'sa', QA: 'qa', OM: 'om',
  KW: 'kw', BH: 'bh', SG: 'sg', MY: 'my', ID: 'id',
  PH: 'ph', IN: 'in', PK: 'pk', LK: 'lk', NP: 'np',
  GB: 'gb', US: 'us', AU: 'au', CA: 'ca', DE: 'de',
};

const VALID_COUNTRY_CODES = new Set(Object.values(GEO_TO_COUNTRY));

export function middleware(request: NextRequest) {
  const url      = new URL(request.url);
  const path     = url.pathname;
  const segments = path.split('/').filter(Boolean);
  const first    = segments[0]?.toLowerCase() || '';

  // ── 1. Validate existing country prefix ──────────────────────────────────
  if (first && !GLOBAL_ROUTES.has(first) && /^[a-z]{2,3}$/.test(first)) {
    if (!VALID_COUNTRY_CODES.has(first)) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // ── 2. IP-based auto-redirect on homepage only ────────────────────────────
  if (path === '/') {
    const alreadyRedirected = request.cookies.get('enm_country_redirected');
    if (!alreadyRedirected) {
      const geoCountry =
        request.geo?.country ||
        request.headers.get('cf-ipcountry') ||
        request.headers.get('x-vercel-ip-country');

      if (geoCountry) {
        const mappedCode = GEO_TO_COUNTRY[geoCountry.toUpperCase()];
        if (mappedCode) {
          const response = NextResponse.redirect(new URL(`/${mappedCode}`, request.url));
          // Short-lived cookie prevents redirect loop on manual root navigation
          response.cookies.set('enm_country_redirected', '1', { maxAge: 60, path: '/' });
          return response;
        }
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
