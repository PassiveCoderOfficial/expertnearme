import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const url = new URL(request.url);
  const path = url.pathname;

  // Country code validation and routing
  const validCountryCodes = ['bd', 'ae', 'qa', 'my', 'th', 'iq', 'sa'];
  const countryMatch = path.match(/^\/([a-z]{2})(\/|$)/);

  if (countryMatch) {
    const countryCode = countryMatch[1].toLowerCase();
    if (!validCountryCodes.includes(countryCode)) {
      return NextResponse.redirect('/');
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
