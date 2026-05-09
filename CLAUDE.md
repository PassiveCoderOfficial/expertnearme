# ExpertNear.Me — Claude Context

## Project
Country-based SaaS for local expert listings. Buyers find experts by country/category. Experts create profiles to receive leads. Multi-country platform.

**Launch date:** August 16, 2026  
**Current branch:** `main`

## Companion Mobile App
- **Repo:** `d:/Dev/Projects/expertnearme-app` → github.com/PassiveCoderOfficial/expertnearme-app
- **Stack:** Expo (React Native), expo-router v6, Zustand, TypeScript
- **EAS project:** `2a20cb92-907f-47b9-a4ec-fcb04d313343` (account: passivecoder)
- **API:** hits `https://expertnear.me` (production) — `constants/index.ts` `API_BASE`
- **Auth:** JWT stored in SecureStore (native) / localStorage (web) via `lib/storage.ts`
- **State:** `store/auth.ts`, `store/country.ts`, `store/onboarding.ts` (all Zustand)
- **Key screens:** onboarding wizard → country → role → auth → tabs (Home/Search/Bookings/Messages/Dashboard)
- **Dashboard:** role switcher (Buyer/Expert/Agent pills) + slide-out drawer nav
- **Build:** `eas build --platform android --profile preview` for APK

## Tech Stack
- **Framework:** Next.js 15 App Router, TypeScript
- **Styling:** TailwindCSS 4, Lucide icons
- **ORM:** Prisma + PostgreSQL (Supabase)
- **Auth:** JWT (custom, not NextAuth)
- **Maps:** `@googlemaps/react-wrapper` + Google Maps JS API
- **Flags:** `country-flag-icons` package (SVG React components via `FlagIcon.tsx`)
- **Animation:** Framer Motion

## Design System
Dark slate theme throughout:
- Background: `bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800`
- Cards: `bg-slate-800/50`, `border border-white/8`
- Accent: `text-orange-400`, `border-orange-500`, `bg-orange-500`
- Text hierarchy: `text-white` > `text-slate-300` > `text-slate-400` > `text-slate-500`
- Rounded: `rounded-2xl` for cards, `rounded-xl` for buttons/inputs

## Multi-Role Auth System (implemented)
- `User` model has `roles[]`, `activeRole`, `defaultRole` (in addition to legacy `role`)
- Signup accepts `role` param → sets all three fields (BUYER/EXPERT/SALES_AGENT)
- Login JWT carries `activeRole` + `roles[]`
- `POST /api/auth/switch-role` → switches `activeRole`, re-issues JWT
- `/api/auth/me` + `/api/auth/session` return `roles[]` + `activeRole`
- `AuthContext` exposes `switchRole()` + `roles[]` + `activeRole`
- Dashboard sidebar shows role switcher pills (Buyer/Expert/Agent)
- Signup page has 3-card role selector

## Roles (RBAC)
`SUPER_ADMIN`, `ADMIN`, `MANAGER`, `MARKETER`, `SEO_EXPERT`, `SALES_AGENT`, `EXPERT`, `BUYER`, `USER`

## Key Routes
| Route | Purpose |
|-------|---------|
| `/` | Global buyer homepage with WorldMap |
| `/[countryCode]` | Country landing page |
| `/[countryCode]/categories` | Category browser |
| `/[countryCode]/categories/[slug]` | Category listing + ExpertMap |
| `/[countryCode]/expert/[slug]` | Expert profile + nearby ExpertMap |
| `/for-experts` | Expert acquisition marketing page |
| `/pricing` | Standalone pricing page |
| `/create-expert-account` | Expert onboarding form (with MapPicker) |
| `/founding-experts` | Hall of Fame (to build) |
| `/dashboard` | Admin/staff dashboard |
| `/dashboard/staff` | Staff management |
| `/dashboard/experts` | Expert management (admin edit with MapPicker) |
| `/dashboard/featured` | Toggle featured/mapFeatured/homeFeatured |
| `/dashboard/profile` | Expert's own profile edit (with MapPicker) |
| `/dashboard/my-subscription` | Subscription status |
| `/dashboard/saved` | Buyer's saved experts |
| `/dashboard/payment-config` | Payment gateway settings |
| `/dashboard/subscriptions` | Subscription management |
| `/dashboard/pricing` | Admin pricing dashboard |
| `/login`, `/signup` | Auth pages |

## Pricing Strategy (finalized)
- **Free:** $0 forever — basic listing, 1 country, 1 category, 5 portfolio images
- **Pro:** $99/month or $499/year — **DISABLED until Aug 16, 2026** (waitlist only)
- **Founding Expert Lifetime:** $999 one-time — **ACTIVE until Aug 15, 2026**, max 500 spots
  - Perks: gold badge, Hall of Fame listing, priority in search, all future Pro features, price locked

`SPOTS_TAKEN` is hardcoded at `47` in `PricingTable.tsx` — wire to `/api/stats/founding-spots` later.

## Key Components
| Component | Purpose |
|-----------|---------|
| `FlagIcon.tsx` | Lazy-loaded SVG flags from `country-flag-icons/react/3x2` |
| `MapPicker.tsx` | Click-to-set lat/lng picker for forms (dark theme, geocoder) |
| `ExpertMap.tsx` | Expert listing map — SVG pins with category icons, info windows |
| `WorldMap.tsx` | Homepage world map with clickable country pins |
| `Navbar.tsx` | Country dropdown with flag icons |
| `CountryPickerModal.tsx` | Full-screen country switcher modal |
| `Logo.tsx` | `LogoMark` component |

## Middleware (`src/middleware.ts`)
- Validates country code prefix (redirects unknown `[a-z]{2,3}` to `/`)
- IP-based geo-redirect on `/` using `request.geo.country` / `cf-ipcountry` / `x-vercel-ip-country`
- Cookie `enm_country_redirected` (maxAge: 60) prevents redirect loops
- `GLOBAL_ROUTES` bypasses country validation: `login`, `signup`, `dashboard`, `api`, etc.

## Database Notes
- Use `prisma db push` (not `migrate dev`) — migration history has drift
- `SavedExpert` model: userId + expertId unique pair, toggle save/unsave
- Expert has: `latitude`, `longitude`, `mapLocation`, `featured`, `mapFeatured`, `homeFeatured`, `foundingExpert`

## Environment Variables Needed
```
DATABASE_URL=
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
```

## Conventions
- Server components fetch data with Prisma directly (no API layer)
- Client components in `src/components/` — mark `'use client'` at top
- API routes in `src/app/api/` — use `getServerSession()` for auth checks
- No comments unless the WHY is non-obvious
- No trailing summaries in responses
