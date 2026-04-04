# Tudor Noir Studio

Premium barber platform built with Next.js App Router, TypeScript, Tailwind CSS, Framer Motion, Prisma, NextAuth, Stripe, and PostgreSQL.

## Stack
- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- Framer Motion
- Prisma ORM + PostgreSQL
- NextAuth v5 with Google and email magic links
- Stripe subscriptions and one-time checkout scaffolding
- Vercel-friendly server routes

## Pages
- `/` landing page with premium hero, services, gallery preview, testimonials, membership teaser, and live content preview
- `/auth/signin` and `/auth/register` for Google or email magic-link auth
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
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `EMAIL_SERVER_HOST`
- `EMAIL_SERVER_PORT`
- `EMAIL_SERVER_USER`
- `EMAIL_SERVER_PASSWORD`
- `EMAIL_FROM`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_APP_URL`
- `STRIPE_SUBSCRIPTION_PRICE_ID`
- `STRIPE_ONE_TIME_PRICE_ID`

## Local Run
1. Install dependencies with `npm install`
2. Create PostgreSQL database and configure `DATABASE_URL`
3. Run `npx prisma generate`
4. Run `npx prisma db push`
5. Optional: seed demo data with `npm run seed`
6. Start the app with `npm run dev`

## Stripe Notes
- `app/api/stripe/checkout/route.ts` creates checkout sessions for either subscription or one-time payments.
- `app/api/stripe/webhook/route.ts` is the webhook entry point; extend it to persist subscription and payment events into Prisma.
- For production, configure Stripe webhooks in Vercel and secure price IDs in env vars.

## Auth Notes
- Google login is enabled through NextAuth.
- Email login uses SMTP-based magic links via the Nodemailer provider.
- Promote a user to admin by setting `role = ADMIN` in the database.

## Deployment
- Optimized for Vercel deployment.
- Add all environment variables in Vercel project settings.
- Use a managed PostgreSQL database.
- Run Prisma migrations or `db push` during deployment workflow.

## Current MVP Boundaries
- The live player is protected at the app layer and ready for a dedicated streaming provider integration.
- Stripe webhook persistence is scaffolded but still needs project-specific business logic for syncing subscriptions and purchases.
- Admin editing UI is intentionally basic and can be expanded with server actions or a CMS workflow.
