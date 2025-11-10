# 🚀 Deployment Guide

## Overview

This guide covers deploying the Invoice Analytics Platform to production.

**Architecture:**
- Frontend + Backend API → **Vercel**
- Vanna AI Service → **Render / Railway / Fly.io**
- Database → **Neon / Supabase / Railway**

---

## 📦 Prerequisites

- [ ] GitHub repository (public or private)
- [ ] Vercel account
- [ ] Hosting account for Vanna AI (Render/Railway/Fly.io)
- [ ] PostgreSQL database (Neon/Supabase/Railway)
- [ ] Groq API key

---

## 1️⃣ Database Setup

### Option A: Neon (Recommended)

1. Go to [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string
4. Format: `postgresql://user:pass@host/dbname?sslmode=require`

### Option B: Supabase

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Get connection string from Settings → Database
4. Use "Connection pooling" URL for better performance

### Option C: Railway

```bash
railway login
railway init
railway add postgresql
railway variables
# Copy DATABASE_URL
```

---

## 2️⃣ Deploy Backend API + Frontend (Vercel)

### Step 1: Prepare Repository

Ensure your repository has:
```
├── apps/
│   ├── web/
│   └── api/
├── package.json
├── turbo.json
└── vercel.json
```

### Step 2: Create vercel.json

Create `vercel.json` in root:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "apps/web/package.json",
      "use": "@vercel/next"
    },
    {
      "src": "apps/api/src/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "apps/api/src/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "apps/web/$1"
    }
  ]
}
```

### Step 3: Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel
```

Or use Vercel Dashboard:
1. Import GitHub repository
2. Select project root
3. Framework: Next.js
4. Build settings automatically detected
5. Add environment variables (see below)

### Step 4: Environment Variables (Vercel)

Add these in Vercel Dashboard → Settings → Environment Variables:

```env
# Database
DATABASE_URL=postgresql://user:pass@host/dbname?sslmode=require

# Backend
PORT=3001
CORS_ORIGIN=https://your-app.vercel.app

# Vanna AI
VANNA_API_BASE_URL=https://your-vanna-service.onrender.com

# Frontend
NEXT_PUBLIC_API_BASE_URL=https://your-app.vercel.app
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### Step 5: Database Migration

```bash
# After deploy, run in Vercel project settings
vercel env pull .env.production.local

# Or use Vercel CLI
cd apps/api
npx prisma generate
npx prisma db push
npx prisma db seed
```

Or set up GitHub Actions for automatic migrations (see below).

---

## 3️⃣ Deploy Vanna AI Service

### Option A: Render

1. **Create Web Service**
   - Go to [render.com](https://render.com)
   - New → Web Service
   - Connect repository
   - Root directory: `services/vanna`
   - Runtime: Python 3.11
   - Build command: `pip install -r requirements.txt`
   - Start command: `python main.py`

2. **Environment Variables**
   ```env
   DATABASE_URL=postgresql+psycopg://user:pass@host:5432/dbname
   GROQ_API_KEY=your_groq_api_key
   PORT=8000
   ALLOWED_ORIGINS=https://your-app.vercel.app
   ```

3. **Deploy**
   - Click "Create Web Service"
   - Copy service URL
   - Update `VANNA_API_BASE_URL` in Vercel

### Option B: Railway

```bash
# Login
railway login

# Create project
railway init

# Link to Vanna service
cd services/vanna

# Deploy
railway up

# Set environment variables
railway variables set DATABASE_URL=...
railway variables set GROQ_API_KEY=...
railway variables set PORT=8000
railway variables set ALLOWED_ORIGINS=...

# Get URL
railway open
```

### Option C: Fly.io

1. **Install Fly CLI**
   ```bash
   # Windows (PowerShell)
   iwr https://fly.io/install.ps1 -useb | iex
   ```

2. **Deploy**
   ```bash
   cd services/vanna
   
   fly launch
   # Follow prompts
   
   # Set secrets
   fly secrets set DATABASE_URL=...
   fly secrets set GROQ_API_KEY=...
   fly secrets set PORT=8000
   fly secrets set ALLOWED_ORIGINS=...
   
   # Deploy
   fly deploy
   ```

3. **Get URL**
   ```bash
   fly status
   # Copy URL
   ```

---

## 4️⃣ GitHub Actions CI/CD (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Build
        run: npm run build
      
      - name: Run Prisma migrations
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
        run: |
          cd apps/api
          npx prisma generate
          npx prisma db push
      
      - name: Deploy to Vercel
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
        run: |
          npm i -g vercel
          vercel --prod --token=$VERCEL_TOKEN
```

Add secrets in GitHub: Settings → Secrets → Actions:
- `DATABASE_URL`
- `VERCEL_TOKEN` (get from Vercel → Settings → Tokens)

---

## 5️⃣ Domain Setup (Optional)

### Vercel Custom Domain

1. Go to Vercel Dashboard → Settings → Domains
2. Add your domain
3. Update DNS records as instructed
4. Wait for SSL certificate (automatic)

### Update Environment Variables

```env
NEXT_PUBLIC_APP_URL=https://your-custom-domain.com
CORS_ORIGIN=https://your-custom-domain.com
ALLOWED_ORIGINS=https://your-custom-domain.com
```

---

## 6️⃣ Post-Deployment Checklist

- [ ] Frontend loads correctly
- [ ] API endpoints respond
- [ ] Database connection works
- [ ] Vanna AI service is accessible
- [ ] Charts and metrics display data
- [ ] Chat with Data feature works
- [ ] CSV export functions
- [ ] Mobile responsive design works
- [ ] HTTPS enabled
- [ ] Custom domain configured (if applicable)

---

## 🧪 Testing Production

```bash
# Test frontend
curl https://your-app.vercel.app

# Test API
curl https://your-app.vercel.app/api/health
curl https://your-app.vercel.app/api/stats

# Test Vanna AI
curl https://your-vanna-service.onrender.com/health
```

---

## 📊 Monitoring (Optional)

### Vercel Analytics

Enable in Vercel Dashboard → Analytics

### Sentry Error Tracking

```bash
npm install @sentry/nextjs @sentry/node

# Configure in apps/web/sentry.config.js
# and apps/api/src/sentry.ts
```

### Uptime Monitoring

- [UptimeRobot](https://uptimerobot.com)
- [Pingdom](https://pingdom.com)
- [Better Uptime](https://betteruptime.com)

---

## 🐛 Troubleshooting

### Build Errors on Vercel

```bash
# Clear build cache
vercel --force

# Check build logs in Vercel Dashboard
```

### Database Connection Issues

- Verify connection string format
- Check firewall/security settings
- Use connection pooling for Serverless

### Vanna AI Service Down

- Check service logs
- Verify environment variables
- Test database connection
- Verify Groq API key

### CORS Errors

- Update `CORS_ORIGIN` environment variable
- Restart services after changing env vars

---

## 💰 Cost Estimates

### Free Tier Setup

- **Vercel**: Free (Hobby plan)
- **Neon**: Free (512 MB storage)
- **Render**: Free (750 hours/month)
- **Total**: $0/month

### Production Setup

- **Vercel Pro**: $20/month
- **Neon Pro**: $20/month
- **Render Standard**: $7/month
- **Total**: ~$47/month

---

## 🎯 Production Optimizations

1. **Database**
   - Enable connection pooling
   - Add database indexes
   - Use read replicas for heavy queries

2. **Frontend**
   - Enable Vercel Analytics
   - Optimize images (next/image)
   - Enable caching

3. **API**
   - Add Redis caching
   - Implement rate limiting
   - Enable compression

4. **Security**
   - Add authentication (NextAuth.js)
   - Implement RBAC
   - Enable HTTPS only
   - Add security headers

---

## 📝 Deployment URLs

Update README.md with your deployed URLs:

```markdown
## Live Demo

- **Frontend**: https://your-app.vercel.app
- **API**: https://your-app.vercel.app/api
- **Vanna AI**: https://your-vanna.onrender.com
- **API Docs**: https://your-app.vercel.app/api
```

---

## 🆘 Support

If you encounter issues:

1. Check service logs
2. Verify environment variables
3. Test database connectivity
4. Check API responses
5. Review deployment documentation

---

**Good luck with your deployment! 🚀**
