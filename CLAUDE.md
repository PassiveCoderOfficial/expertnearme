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
- **Framework:** Next.js 16 App Router, TypeScript
- **Styling:** TailwindCSS 4, Lucide icons
- **ORM:** Prisma + PostgreSQL (Supabase) — use `prisma db push`, `directUrl` set in schema
- **Auth:** JWT (custom, not NextAuth)
- **Maps:** `@googlemaps/react-wrapper` + Google Maps JS API
- **Flags:** `country-flag-icons` package (SVG React components via `FlagIcon.tsx`)
- **Animation:** Framer Motion
- **Storage:** Supabase Storage (`uploads` bucket) via `supabaseServer` — media upload API at `/api/media`

## Design System
Full light/dark dual-theme. Default = **light**. `next-themes` with `defaultTheme="light"`, `attribute="class"`, `storageKey="enm-theme"`. ThemeToggle cycles light → system → dark.

**Pattern for all public pages** — always use `dark:` variants, never hardcode dark:
- Background: `bg-white dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-800`
- Cards: `bg-white dark:bg-slate-800/50`, `border border-slate-100 dark:border-white/8`, `shadow-sm dark:shadow-none`
- Accent: `text-orange-500 dark:text-orange-400`, `border-orange-500`, `bg-orange-500`
- Text hierarchy: `text-slate-900 dark:text-white` > `text-slate-600 dark:text-slate-300` > `text-slate-500 dark:text-slate-400`
- Inputs: `bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white`
- Rounded: `rounded-2xl` for cards, `rounded-xl` for buttons/inputs
- Buttons: orange CTAs always `text-white` (not `text-slate-900`)

**Dashboard** — intentionally stays dark-only (admin tool, not public-facing).

**Maps (ExpertMap, WorldMap)** — use `useTheme` from `next-themes`, `resolvedTheme === 'dark'` → pass `isDark` prop → switch between `DARK_STYLE`/`LIGHT_STYLE` Google Maps style arrays. Info windows and overlays also theme-switch via inline style vars.

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
| `/` | Global buyer homepage (country cards, stats, no map) |
| `/[countryCode]` | Country landing page |
| `/[countryCode]/categories` | Category browser |
| `/[countryCode]/categories/[slug]` | Category listing + ExpertMap |
| `/[countryCode]/expert/[slug]` | Expert profile + nearby ExpertMap |
| `/for-experts` | Redirects → `/pricing` (server redirect) |
| `/pricing` | Full marketing + pricing page (merged from /for-experts) |
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
- **Pro Monthly / Pro Yearly** — toggled in single card; toggle hidden if only one exists; inactive = Coming Soon overlay
- **Founding Expert Lifetime** — **ACTIVE until Aug 15, 2026**, max 500 spots
  - Perks: gold badge, Hall of Fame listing, priority in search, all future Pro features, price locked

`SPOTS_TAKEN` hardcoded at `47` in `PricingTable.tsx` — wire to `/api/stats/founding-spots` later.

## Key Components
| Component | Purpose |
|-----------|---------|
| `FlagIcon.tsx` | Lazy-loaded SVG flags from `country-flag-icons/react/3x2` |
| `MapPicker.tsx` | Click-to-set lat/lng picker for forms (dark theme, geocoder) |
| `ExpertMap.tsx` | Expert listing map — SVG pins with category icons, info windows |
| `WorldMap.tsx` | Unused — removed from homepage (no Maps API key) |
| `Navbar.tsx` | Sitewide; ☰ toggle (mobile, dashboard only) left of logo dispatches `toggle-dashboard-sidebar` event |
| `CountryPickerModal.tsx` | Full-screen country switcher modal |
| `Logo.tsx` | `LogoMark` component |
| `PortfolioLightbox.tsx` | Client component — portfolio grid with lightbox, YouTube/Vimeo embed, keyboard nav |
| `PricingTable.tsx` | Full pricing page — `SPOTS_TAKEN` hardcoded at 47 (wire to `/api/stats/founding-spots` later); lifetime vs pro comparison line is dynamic from plan prices |

## Middleware (`src/middleware.ts`)
- Validates country code prefix (redirects unknown `[a-z]{2,3}` to `/`)
- IP-based geo-redirect on `/` using `request.geo.country` / `cf-ipcountry` / `x-vercel-ip-country`
- Cookie `enm_country_redirected` (maxAge: 60) prevents redirect loops
- `GLOBAL_ROUTES` bypasses country validation: `login`, `signup`, `dashboard`, `api`, etc.

## Database Notes
- Use `prisma db push` (not `migrate dev`) — migration history has drift
- Schema datasource has `directUrl = env("DIRECT_URL")` — required for push to work (pooler URL alone fails)
- `SavedExpert` model: userId + expertId unique pair, toggle save/unsave
- Expert has: `latitude`, `longitude`, `mapLocation`, `featured`, `mapFeatured`, `homeFeatured`, `foundingExpert`
- Expert also has: `linkedinUrl`, `instagramUrl`, `twitterUrl`, `facebookUrl` (social links)
- `Portfolio` model: `id`, `expertId`, `title`, `description`, `imageUrl`, `videoUrl`, `socialUrl`, `sortOrder`
- `Service` model: `id`, `expertId`, `name`, `description`, `rateUnit`, `price`, `image`, `sortOrder`, booking fields

## Environment Variables Needed
```
DATABASE_URL=
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
```

## Favicon
`src/app/icon.svg` — orange pin SVG (LogoMark). Next.js auto-serves as favicon.

## Dashboard Mobile Nav
- Main Navbar always visible (no hide on dashboard)
- ☰ button (mobile only, dashboard pages) dispatches `CustomEvent('toggle-dashboard-sidebar')`
- `dashboard/layout.tsx` listens for that event → toggles sidebar
- Sidebar overlay `z-40`, Navbar `z-50` (Navbar always on top)

## Conventions
- Server components fetch data with Prisma directly (no API layer) — never use `fetch()` to own API from server components
- Client components in `src/components/` — mark `'use client'` at top
- API routes in `src/app/api/` — use `getSession()` (not `getServerSession()`) for auth checks
- No comments unless the WHY is non-obvious
- No trailing summaries in responses
- Pages that were previously `"use client"` with `useEffect` fetch — convert to server components if no interactivity needed (performance critical)
- All Prisma `contains` queries must use `mode: "insensitive"` — `/api/search/route.ts` already does this
- `create-expert-account/page.tsx` intentionally forces light theme (no `dark:` variants) — do not add dark variants back
- `/api/dashboard/experts?search=...` returns bare array (not `{ experts: [] }`) — use `Array.isArray(data) ? data : (data.experts || [])` defensively

## Expert Self-Service APIs
| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/me/expert` | GET, PATCH | Expert profile (includes social links, lat/lng) |
| `/api/me/portfolio` | GET, POST, PATCH, DELETE | Portfolio CRUD (max 20 items) |
| `/api/me/services` | GET, POST, PATCH, DELETE | Services CRUD (max 20 items) |
| `/api/media` | GET, POST | Media upload to Supabase (10MB max, images only) |

## Performance Notes
- `page.tsx` (homepage) — `revalidate = 300` (was `force-dynamic` — caused slow loads)
- `[countryCode]/page.tsx` — server component, 4 parallel Prisma queries incl. `review.aggregate(_avg)` for rating (not full reviews load), `revalidate = 3600`
- `[countryCode]/categories/page.tsx` — server component, `revalidate = 3600`
- `[countryCode]/categories/[slug]/page.tsx` — server component, `revalidate = 3600`
- `[countryCode]/expert/[slug]/page.tsx` — server component, `revalidate = 3600`; **no `generateStaticParams`** — Prisma can't connect during Vercel build phase, causes 500
- `/api/ads/active` — `Cache-Control: public, s-maxage=60, stale-while-revalidate=120`
- DB indexes added: `Expert(countryCode,verified)`, `Expert(countryCode,featured)`, `Expert(latitude,longitude)`, `ExpertCategory(categoryId)`, `Review(expertId)`, `Review(expertId,createdAt)`, `AdCampaign(status,startsAt,endsAt)`, `AdCampaign(status,targetCountry)` — run `prisma db push` if not applied
- Dashboard pages can stay as client components (CRUD interactivity needed)
- Country switcher: deep routes (`/[cc]/expert/[slug]`, `/[cc]/categories/[slug]`) redirect to country homepage when switching country — slugs don't exist cross-country

## Ads & Featured System
- 7 `AdSpot` enum values: `BANNER_TOP`, `SEARCH_SPONSOR`, `HOMEPAGE_FEATURED`, `COUNTRY_FEATURED`, `CATEGORY_FEATURED`, `PROFILE_SIDEBAR`, `MAP_FEATURED`
- `AdPlacement` model: spot, weeklyPrice, monthlyPrice, maxSlots, active
- `AdCampaign` model: expertId, spot, status (PENDING/ACTIVE/PAUSED/REJECTED/CANCELLED), billing, country, category, impressions, clicks, `bannerImageUrl` (desktop 1200×90), `bannerMobileImageUrl` (mobile 400×90), `bannerLinkUrl`, `bannerAltText`
- Shared rotation model (spots 2-7): weekly/monthly pricing, admin sets maxSlots
- Admin dashboard: `/dashboard/ads` — 3 tabs: Placements Config, Active Campaigns, Credit Packages; create-campaign modal has side-by-side desktop/mobile banner URL inputs
- Expert self-service: `/dashboard/promote` — Browse Spots + My Campaigns tabs; buy modal with desktop/mobile banner URL inputs
- API: `/api/admin/ad-placements`, `/api/admin/ad-campaigns`, `/api/admin/ad-campaigns/[id]`, `/api/ads/active`, `/api/admin/credits`, `/api/me/ad-campaigns`
- Frontend: `AdBanner.tsx` (BANNER_TOP, dismissable, orange bg fallback, mobile image shown `< sm` / desktop on `sm+`), `AdFeaturedExperts.tsx` (spots 3-6, grid/list/compact layouts)
- Layout: navbar spacer `h-16 shrink-0` in `layout.tsx` (navbar is fixed, zero flow height); `AdBanner` placed after spacer, before page children — pages must NOT add their own 64px navbar offset
- All page top-padding already reduced by 64px (pt-28→pt-12, pt-24→pt-8, pt-20→pt-4, pt-16 removed where applicable)
- `SEARCH_SPONSOR` slot exists in DB/API but not yet wired into SearchBar dropdown

## Blog System
- `BlogPost` model with `BlogStatus` enum: DRAFT/SCHEDULED/PUBLISHED/ARCHIVED
- `countryCode = null` = global post (shown everywhere)
- Scheduled posts auto-published by GitHub Actions hourly cron → `/api/admin/blog/publish-scheduled` (Bearer CRON_SECRET)
- Rich text editor: Tiptap v3 — `TextStyle`/`Color` are named exports from `@tiptap/extension-text-style`
- Blog dashboard (`/dashboard/blog`): bulk select, bulk status change, bulk delete, view button for published posts
- Blog frontend route `/blog/[slug]` — server component, Prisma direct fetch, 404 if not PUBLISHED, increments `viewCount` fire-and-forget, `.blog-content` CSS class in `globals.css` for HTML content styling (no typography plugin — TailwindCSS 4)

## Backup System
- GitHub Actions workflow: `.github/workflows/backup.yml` — runs hourly
- 3 jobs in parallel: code snapshot, pg_dump, Supabase storage download
- Dual destination: Google Drive (OAuth refresh token via Drive API, no rclone) + FTP (Pure-FTPd with TLS, `--ssl-reqd`)
- Count-based retention: keep last N hourly per day × last N days (default 4×6=24 max per type)
- Config stored in `Setting` table keys: `backup_enabled`, `backup_hourly_keep`, `backup_daily_keep`, `backup_include_*`
- Admin panel: `/dashboard/backup` — toggle enable, set retention, manual trigger via GitHub dispatch API
- API: `/api/admin/backup/config` (SUPER_ADMIN PATCH), `/api/admin/backup/status` (workflow POST), `/api/admin/backup/trigger` (GitHub dispatch)
- Scripts in `scripts/backup/`: `backup-code.sh`, `backup-db.sh`, `backup-storage.sh`, `gdrive-upload.sh`, `prune-old-backups.sh`
- pg_dump uses pooler URL (not direct) — Supabase blocks direct connections from GitHub Actions IPs
- FTP: `backup@fullready.site` on `131.153.48.203`, dir `expertnearme_backup`
- Required GitHub secrets: `DATABASE_URL` (pooler), `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `GDRIVE_CLIENT_ID`, `GDRIVE_CLIENT_SECRET`, `GDRIVE_REFRESH_TOKEN`, `GDRIVE_FOLDER_ID`, `FTP_HOST`, `FTP_USER`, `FTP_PASS`, `FTP_DIR`, `GH_OWNER`, `GH_PAT`, `GH_REPO`

## Key Routes (updated)
Additional routes added:
| Route | Purpose |
|-------|---------|
| `/dashboard/ads` | Ads & featured placement management (admin) |
| `/dashboard/promote` | Expert self-service ad campaign creation |
| `/dashboard/backup` | Backup system config + manual trigger (SUPER_ADMIN) |
| `/dashboard/blog` | Blog post management with bulk actions |
| `/blog/[slug]` | Blog frontend (server component, public) |
| `/dashboard/agents` | Agent referral dashboard — generate links, view commissions |

## Agent & Referral System
- `AgentReferral` model: `referrerId`, `referralCode` (`ENM-{userId}-{timestamp36}`), `commissionPct`, `status`, `referredUser`, `commissions[]`
- `AgentCommission` model: `referrerId`, `amount`, `type`, `status` (PENDING/APPROVED/PAID/CANCELLED)
- API: `GET /api/admin/agents` — own referrals + earnings; `?admin=1` for admin view (all referrals)
- API: `POST /api/admin/agents` — create referral link; returns full record **with `commissions` + `referredUser` included** (required — page calls `.reduce()` on commissions)
- Commission %: read from `Setting` key `expertSubscriptionCommissionPct` (default 20%)
- Commission structure: 20% recurring on expert subscriptions, 50% of booking fee (platform cut), 20% one-time on lifetime deals
