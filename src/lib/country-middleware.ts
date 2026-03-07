import { NextResponse } from "next/server";

export const runtime = 'edge';

const COUNTRIES = [
  { code: "bd", name: "Bangladesh", currency: "BDT", timezone: "Asia/Dhaka", flag: "🇧🇩" },
  { code: "ae", name: "UAE", currency: "AED", timezone: "Asia/Dubai", flag: "🇦🇪" },
  { code: "qa", name: "Qatar", currency: "QAR", timezone: "Asia/Qatar", flag: "🇶🇦" },
  { code: "my", name: "Malaysia", currency: "MYR", timezone: "Asia/Kuala_Lumpur", flag: "🇲🇾" },
  { code: "th", name: "Thailand", currency: "THB", timezone: "Asia/Bangkok", flag: "🇹🇭" },
  { code: "iq", name: "Iraq", currency: "IQD", timezone: "Asia/Baghdad", flag: "🇮🇶" },
  { code: "sa", name: "Saudi Arabia", currency: "SAR", timezone: "Asia/Riyadh", flag: "🇸🇦" },
];

export function middleware(request: Request) {
  const url = new URL(request.url);
  const path = url.pathname;

  // Handle country code routes
  const countryCodeMatch = path.match(/^\/([a-z]{2})\/?(.*)$/);
  
  if (countryCodeMatch) {
    const countryCode = countryCodeMatch[1].toLowerCase();
    const country = COUNTRIES.find(c => c.code === countryCode);
    
    if (!country) {
      return NextResponse.redirect('/');
    }

    // Allow access to this country's routes
    return NextResponse.next();
  }

  // Handle /[country-code]/... routes by rewriting
  if (path.startsWith('/') && path !== '/' && path.match(/^\/[a-z]{2}(\/|$)/)) {
    return NextResponse.next();
  }

  return NextResponse.next();
}
