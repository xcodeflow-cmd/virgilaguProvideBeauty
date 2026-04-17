# Tudor Noir Studio

Premium barber platform built with Next.js App Router, TypeScript, Tailwind CSS, Framer Motion, Prisma, NextAuth credentials auth, Stripe, and PostgreSQL.

## Stack
- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- Framer Motion
- Prisma ORM + PostgreSQL
- NextAuth with email + password authentication
- Stripe subscriptions and one-time checkout persistence
- Vercel-friendly server routes

## Pages
- `/` landing page with premium hero, services, gallery preview, testimonials, membership teaser, and live content preview
- `/auth/signin` and `/auth/register` for classic account authentication
- `/dashboard` protected member area
- `/live` premium streaming page with gated player structure
- `/gallery` portfolio grid with modal viewer
- `/contact` luxury contact section plus booking form
- `/admin` basic role-gated admin surface

## Folder Structure
```text
app/
  api/
  admin/
  auth/
  contact/
  dashboard/
  gallery/
  live/
components/
  sections/
  ui/
lib/
prisma/
```

## Environment Variables
Copy `.env.example` to `.env` and fill in:
- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_APP_URL`
- `STRIPE_SUBSCRIPTION_PRICE_ID`
- `STRIPE_ONE_TIME_PRICE_ID`
- `NEXT_PUBLIC_LIVEKIT_URL`
- `LIVEKIT_API_KEY`
- `LIVEKIT_API_SECRET`

## Local Run
1. Install dependencies with `npm install`
2. Create PostgreSQL database and configure `DATABASE_URL`
3. Run `npm run prisma:migrate:deploy`
4. Optional: seed demo data with `npm run seed`
5. Start the app with `npm run dev`

## Stripe Notes
- `app/api/stripe/checkout/route.ts` creates checkout sessions for either subscription or one-time payments.
- `app/api/stripe/webhook/route.ts` persists Stripe subscription and purchase events into Prisma.
- For production, configure the Stripe webhook endpoint in Vercel and secure price IDs in env vars.

## Auth Notes
- Authentication uses email and password via the NextAuth credentials provider.
- Registration is handled through `app/api/auth/register/route.ts` and passwords are stored hashed.
- Promote a user to admin by setting `role = ADMIN` in the database.

## Deployment
- Optimized for Vercel deployment.
- Add all environment variables in Vercel project settings.
- Use a managed PostgreSQL database.
- Install Command: `npm install`
- Build Command: `npm run build`
- Node.js Version: `22.x`
- Keep `mediasoup` and `ws` isolated to `live-server/`; do not add them to the root app dependencies or Vercel will waste time compiling native modules during deploy.
- Run `npm run prisma:migrate:deploy` against the production database before first production launch, or add it to the Vercel build command if you explicitly want automatic migrations on each deploy.

## Current MVP Boundaries
- The live player is protected at the app layer and ready for a dedicated streaming provider integration.
- Admin editing UI is intentionally basic and can be expanded with server actions or a CMS workflow.
