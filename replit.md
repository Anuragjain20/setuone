# SevaSetu

A hyperlocal home-services marketplace connecting Indore residents with verified local craftsmen (plumbers, carpenters, electricians, painters, and more).

## Overview

SevaSetu (meaning "Service Bridge" in Hindi) is a full-featured pre-launch MVP including:
- Public landing page with service catalogue, trust signals, and booking CTAs
- 5-step booking flow (service → location → schedule → description → contact)
- OTP phone authentication (session-based, 4-digit OTP stored in DB; devOtp returned in dev mode)
- Customer booking history with status filter, cancel, dispute/flag, rating, invoice and payment
- Admin dashboard with live metrics, revenue chart, pending dispatch queue, booking management
- Admin notifications panel — logs all outgoing SMS/WhatsApp messages and craftsman applications
- Craftsmen registry with verification, availability toggle, approve/reject applicants
- Site CMS — editable landing copy, service photos, testimonials, pricing plans
- Karigar Portal — craftsmen view/manage assigned jobs by phone lookup
- Craftsman self-registration form (`/join`) — skills/areas multi-select, pending → admin approval
- Printable invoice page per booking
- Simulated Razorpay payment flow (UPI / Card / Cash)
- Legal pages: Terms, Privacy Policy, Refund Policy
- SEO meta tags + structured data (LocalBusiness schema)

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (`artifacts/sevasetu`) — saffron/terracotta palette (`#FAF8F4`, `#1A1209`, `#5C5043`)
- **API framework**: Express 5 (`artifacts/api-server`)
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: express-session + OTP flow (SESSION_SECRET env var)
- **Validation**: Zod (zod/v4), drizzle-zod
- **API codegen**: Orval (from OpenAPI spec in `lib/api-spec`)
- **Build**: esbuild (CJS bundle)
- **Routing**: wouter
- **Animations**: framer-motion
- **Charts**: recharts
- **UI**: shadcn/ui + tailwind

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

## Database Schema

- `services` — service catalogue (category, icon, pricing, priority)
- `craftsmen` — karigar profiles (skills, areas, rating, availability, applicationStatus: pending/approved/rejected)
- `bookings` — job bookings (status, craftsmanId, isFlagged, flagReason, completionNotes, paymentStatus)
- `users` — customer accounts (phone, name, lastOtp, otpExpiresAt, isVerified)
- `notifications` — message log (type, recipientPhone, message, channel: sms/whatsapp, bookingId)
- `testimonials` — landing page testimonials (toggleable via CMS)
- `site_config` — key-value CMS config for landing page content

## Services

- **Plumbing, Carpentry, Electrical** (P0) — core services
- **Painting, AC Service, Home Cleaning** (P1)
- **Pest Control, CCTV/Security** (P2)

## Seed Data

- 8 service categories pre-seeded
- 6 craftsmen (Ramesh, Suresh, Mukesh, Dinesh, Kamlesh, Prakash) — all approved
- 7 sample bookings across various statuses

## Pages

### Customer-facing
- `/` — Landing page (service cards, testimonials, How It Works, pricing)
- `/book` — Multi-step booking flow
- `/bookings` — Customer booking history (requires OTP login); cancel, flag, rate, pay, invoice
- `/bookings/:id/invoice` — Printable invoice
- `/bookings/:id/pay` — Payment flow (UPI/Card/Cash simulation)
- `/join` — Craftsman self-registration form (public)
- `/craftsman` — Karigar Portal (phone-based job management)
- `/terms` — Terms of Service
- `/privacy` — Privacy Policy
- `/refund` — Refund & Cancellation Policy

### Admin
- `/admin` — Dashboard (metrics, revenue chart, dispatch queue, all bookings)
- `/admin/craftsmen` — Craftsmen registry (add, verify, toggle availability)
- `/admin/content` — Site CMS (hero copy, service photos, testimonials, pricing)
- `/admin/notifications` — Message log + craftsman applicant approval queue

## API Routes

All routes served at `/api`:

### Auth
- `POST /auth/request-otp` — Generate OTP (returns devOtp in dev), logs to notifications
- `POST /auth/verify-otp` — Verify OTP, create session
- `GET /auth/me` — Current user from session
- `PATCH /auth/me` — Update user name
- `POST /auth/logout` — Destroy session

### Bookings
- `GET /bookings` — List bookings (supports `?phone=` and `?status=` filters)
- `POST /bookings` — Create booking (triggers WhatsApp notification)
- `GET /bookings/:id` — Get booking
- `PATCH /bookings/:id` — Update booking (status/craftsman/rating — triggers notifications)
- `POST /bookings/:id/cancel` — Cancel (pending/confirmed only)
- `POST /bookings/:id/flag` — Flag with reason (dispute)
- `POST /bookings/:id/complete` — Complete with notes and amount
- `POST /bookings/:id/pay` — Mark as paid

### Craftsmen
- `GET /craftsmen` — List craftsmen (supports `?available=` and `?applicationStatus=` filters)
- `POST /craftsmen` — Add craftsman (admin)
- `POST /craftsmen/apply` — Public self-registration (sets applicationStatus: pending)
- `GET /craftsmen/my-jobs` — Get craftsman + their jobs by `?phone=`
- `GET /craftsmen/:id` — Get craftsman
- `PATCH /craftsmen/:id` — Update craftsman (including applicationStatus for approve/reject)

### Other
- `GET /notifications` — List all notification logs
- `GET /services` — Service catalogue
- `GET/PATCH /site-config` — CMS key-value config
- `GET/POST/PATCH/DELETE /testimonials` — Testimonials CRUD
- `GET /admin/dashboard` — Summary metrics
- `GET /admin/revenue` — Daily revenue breakdown

## Auth Notes

- Session stored server-side via express-session (SESSION_SECRET env var)
- OTP is 4 digits, expires in 10 minutes, stored in `users.last_otp`
- In development, `devOtp` is returned in the API response (no SMS needed)
- In production, hook up MSG91 or Twilio to actually send the SMS
- Notifications are always logged to the `notifications` table regardless of SMS delivery

## Notifications

All SMS/WhatsApp notifications are simulated — stored in the `notifications` table with `status: "sent"`. In production, replace the `notify()` function in `bookings.ts` and `auth.ts` with real MSG91/Twilio API calls. The admin `/admin/notifications` page shows the full message log with channel, type, and timestamp.

## Notes on Codegen

The orval config generates `lib/api-zod/src/index.ts` which previously caused duplicate exports. A fixup node command in the codegen script ensures only `./generated/api` is exported. See `lib/api-spec/package.json`.
