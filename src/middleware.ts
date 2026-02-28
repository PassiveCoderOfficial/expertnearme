import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of supported country codes
const SUPPORTED_COUNTRIES = new Set(['ae', 'sa', 'sg', 'bd', 'in', 'om', 'qa', 'kw', 'bh']);

// List of countries that should redirect to their own domain (if you want to add custom domains later)
const CUSTOM_DOMAIN_COUNTRIES = new Set(['ae', 'sa']);

// Get visitor's country from IP or accept-language header
function getVisitorCountry(request: NextRequest): string {
  // Try to get country from IP (this would require a geolocation service)
  // For now, we'll use a simple approach with accept-language header
  const acceptLanguage = request.headers.get('accept-language') || '';
  const languages = acceptLanguage.split(',').map(lang => lang.split(';')[0].trim());
  
  // Check if any language is a supported country code (e.g., 'en-AE' -> 'ae')
  for (const lang of languages) {
    const countryCode = lang.split('-')[1]?.toLowerCase();
    if (countryCode && SUPPORTED_COUNTRIES.has(countryCode)) {
      return countryCode;
    }
  }
  
  // Default fallback
  return 'global';
}

// Check if current URL matches a country route
function isCountryRoute(pathname: string): boolean {
  const segments = pathname.split('/').filter(Boolean);
  return segments.length > 0 && SUPPORTED_COUNTRIES.has(segments[0]);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // If it's an API route, let it pass through
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }
  
  // If it's a static asset, let it pass through
  if (pathname.startsWith('/_next/') || pathname.startsWith('/static/')) {
    return NextResponse.next();
  }
  
  // If it's already a country route, let it pass through
  if (isCountryRoute(pathname)) {
    return NextResponse.next();
  }
  
  // Get visitor's country
  const visitorCountry = getVisitorCountry(request);
  
  // If visitor is from a supported country, redirect to country-specific route
  if (visitorCountry !== 'global' && SUPPORTED_COUNTRIES.has(visitorCountry)) {
    const newUrl = new URL(`/${visitorCountry}${pathname}`, request.url);
    return NextResponse.redirect(newUrl);
  }
  
  // For global visitors, show the landing page with country selector
  if (pathname === '/') {
    return NextResponse.next();
  }
  
  // For other routes, redirect to home
  const newUrl = new URL('/', request.url);
  return NextResponse.redirect(newUrl);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};