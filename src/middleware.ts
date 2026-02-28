import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Minimal country detection middleware
const SUPPORTED_COUNTRIES = ['ae', 'sa', 'sg', 'bd', 'in', 'om', 'qa', 'kw', 'bh'];

function getVisitorCountry(request: NextRequest): string | null {
  const acceptLanguage = request.headers.get('accept-language') || '';
  const languages = acceptLanguage.split(',').map(lang => lang.split(';')[0].trim());
  
  for (const lang of languages) {
    const countryCode = lang.split('-')[1]?.toLowerCase();
    if (countryCode && SUPPORTED_COUNTRIES.includes(countryCode)) {
      return countryCode;
    }
  }
  
  return null;
}

function isCountryRoute(pathname: string): boolean {
  const firstSegment = pathname.split('/').filter(Boolean)[0];
  return firstSegment && SUPPORTED_COUNTRIES.includes(firstSegment);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip API routes and static assets
  if (pathname.startsWith('/api/') || pathname.startsWith('/_next/') || pathname.startsWith('/static/')) {
    return NextResponse.next();
  }
  
  // Already a country route
  if (isCountryRoute(pathname)) {
    return NextResponse.next();
  }
  
  // Detect and redirect to country-specific route
  const country = getVisitorCountry(request);
  if (country) {
    const newUrl = new URL(`/${country}${pathname}`, request.url);
    return NextResponse.redirect(newUrl);
  }
  
  // Default to home page
  if (pathname !== '/') {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};