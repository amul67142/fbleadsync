# LeadSync for RealVibe

Real-time Meta Lead Ads integration & CRM dashboard built with Next.js 14, standard Prisma ORM (MySQL), Tailwind CSS, and shadcn/ui.

## Tech Stack
- **Framework**: Next.js 14 (App Router, TypeScript)
- **Database**: MySQL
- **ORM**: Prisma
- **Styling**: Tailwind CSS + shadcn/ui
- **Deploy**: Vercel

## Local Setup Instructions

1. **Clone the repository** (if not already done).

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Fill in the required values:
   - `DATABASE_URL`: Your MySQL connection string (e.g. `mysql://user:pass@host:3306/leadsync`)
   - `META_VERIFY_TOKEN`: A secure random string you choose for the webhook setup.
   - `META_PAGE_ACCESS_TOKEN`: The long-lived page access token from Meta Developer Portal.

4. **Initialize Database**:
   Push the Prisma schema to your MySQL database:
   ```bash
   npx prisma db push
   # Alternatively for migrations: npx prisma migrate dev --name init
   ```

5. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   The dashboard runs at `http://localhost:3000/dashboard` and the webhook endpoint is at `http://localhost:3000/api/meta/webhook`.

6. **Testing Webhooks Locally**:
   Expose your server with `localtunnel` or `ngrok`:
   ```bash
   npx localtunnel --port 3000
   ```
   Use the generated tunnel URL (e.g., `https://your-tunnel.loca.lt/api/meta/webhook`) as the Meta webhook callback URL.

## Vercel Deployment Guide

Deploying to Vercel requires setting up your project and environment variables appropriately:

1. **Push to GitHub**: Push the complete codebase to your GitHub/GitLab repository.
2. **Import Project to Vercel**: Inside Vercel, select your repository and choose to construct an App Router compatible build.
3. **Configure Environment Variables in Vercel**: 
   Add all necessary strings (`DATABASE_URL`, `META_VERIFY_TOKEN`, `META_PAGE_ACCESS_TOKEN`) using the Settings > Environment Variables tab in the dashboard.
4. **Build Command Optimization**:
   Vercel automatically understands Next.js, but because you are utilizing Prisma, you should consider updating your `package.json` build command to automatically generate models. 
   Optionally change the build script in `package.json` to:
   `"build": "prisma generate && prisma db push && next build"` OR you can configure this specifically in Vercel's Build Override settings if using strict database migrations.

## Webhook Operations Note
- The POST listener at `/api/meta/webhook` always resolves with a 200 OK gracefully to stop Meta from aggressively retrying and disabling the hook.
- It intercepts duplicate events using `prisma.lead.upsert()`. No ghost records will be created.
