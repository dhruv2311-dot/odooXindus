# CoreInventory Deployment Guide

This guide covers production deployment for both backend and frontend.

## Recommended Hosting Setup

- Backend API: Render Web Service
- Frontend SPA: Vercel Project
- Database/Auth: Supabase (already managed)

You can use other providers, but this document is optimized for this stack.

## 1. Pre-Deployment Checklist

- Confirm all local changes are committed to your Git repository.
- Confirm Supabase project is active and required tables exist.
- Confirm SMTP credentials are valid for custom OTP emails.
- Confirm production domain names are available (optional, but recommended).

## 2. Environment Variables

## Backend Environment (server service)

Set these in your backend host (Render, Railway, etc.):

- PORT (usually auto-set by platform)
- JWT_SECRET
- SUPABASE_URL
- SUPABASE_KEY
- SUPABASE_SERVICE_ROLE_KEY
- FRONTEND_URL
- SMTP_HOST
- SMTP_PORT
- SMTP_USER
- SMTP_PASS
- SMTP_FROM_EMAIL
- SMTP_FROM_NAME
- PASSWORD_RESET_OTP_EXPIRY_MINUTES
- PASSWORD_RESET_OTP_COOLDOWN_SECONDS
- PASSWORD_RESET_OTP_MAX_ATTEMPTS

Production example:

```dotenv
JWT_SECRET=replace_with_a_long_secure_secret
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
FRONTEND_URL=https://your-frontend-domain.com

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
SMTP_FROM_EMAIL=your_email@gmail.com
SMTP_FROM_NAME=CoreInventory

PASSWORD_RESET_OTP_EXPIRY_MINUTES=10
PASSWORD_RESET_OTP_COOLDOWN_SECONDS=60
PASSWORD_RESET_OTP_MAX_ATTEMPTS=5
```

## Frontend Environment (frontend service)

Set these in your frontend host (Vercel, Netlify, etc.):

- VITE_API_URL
- VITE_SUPABASE_URL
- VITE_SUPABASE_KEY

Production example:

```dotenv
VITE_API_URL=https://your-backend-domain.com
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_KEY=your_supabase_anon_key
```

## 3. Backend Deployment (Render)

1. Push repository to GitHub.
2. Open Render and create a new Web Service.
3. Connect the repository.
4. Configure service:
   - Root Directory: server
   - Runtime: Node
   - Build Command: npm install
   - Start Command: npm start
5. Add backend environment variables listed above.
6. Deploy and wait for successful build.
7. Copy the backend URL, for example:
   - https://coreinventory-api.onrender.com

## 4. Frontend Deployment (Vercel)

1. Open Vercel and import the same repository.
2. Configure project:
   - Root Directory: frontend
   - Framework Preset: Vite
   - Build Command: npm run build
   - Output Directory: dist
3. Add frontend environment variables listed above.
4. Deploy and wait for successful build.
5. Copy frontend URL, for example:
   - https://coreinventory.vercel.app

## 5. Cross-Link Update

After both deployments are live:

1. Update backend FRONTEND_URL with your real frontend domain.
2. Update frontend VITE_API_URL with your real backend domain.
3. Redeploy both services after env changes.

## 6. Supabase Configuration for Production

Authentication settings:

- Add production Site URL.
- Add allowed Redirect URLs.
- Confirm email templates for signup and reset flows.

If using custom OTP (server SMTP path), make sure SMTP provider is healthy and not blocked.

## 7. Verification Tests

After deployment, verify:

- Signup request works and account is created.
- Login works and token is returned.
- Forgot password sends OTP email.
- OTP verification updates password.
- Inventory routes load without CORS issues.
- Dashboard and protected routes open correctly.

Quick API smoke checks:

- GET/POST to auth endpoints
- Products list endpoint
- Receipts and deliveries list endpoints

## 8. Troubleshooting

Signup returns 400:

- Check backend logs for Supabase auth message.
- Verify SUPABASE_URL, SUPABASE_KEY, and template settings.

Forgot password OTP not sent:

- Verify SMTP_USER and SMTP_PASS.
- If using Gmail, confirm App Password is used (not account password).
- Check provider bounce/spam policies.

Frontend cannot reach backend:

- Verify VITE_API_URL points to deployed backend URL.
- Verify backend service is healthy.
- Verify frontend rebuild after env updates.

## 9. Optional Hardening (Recommended)

- Restrict CORS to frontend production domain(s).
- Rotate JWT secret and SMTP credentials regularly.
- Add monitoring and uptime alerts.
- Add backup and migration policy for schema changes.

## 10. Deployment Commands Reference

Backend local sanity:

```bash
cd server
npm install
npm start
```

Frontend local sanity:

```bash
cd frontend
npm install
npm run build
npm run preview
```
