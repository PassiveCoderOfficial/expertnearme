import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const VALID_COUNTRY_CODES = new Set(['bd', 'ae', 'qa', 'my', 'th', 'iq', 'sa', 'sg', 'om', 'uae']);

export function middleware(request: NextRequest) {
  const url = new URL(request.url);
  const path = url.pathname;

  const countryMatch = path.match(/^\/([a-z]{2,3})(\/|$)/);

  if (countryMatch) {
    const countryCode = countryMatch[1].toLowerCase();
    if (!VALID_COUNTRY_CODES.has(countryCode)) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
