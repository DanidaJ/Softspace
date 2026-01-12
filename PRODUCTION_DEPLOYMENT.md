# 🚀 Production Deployment Guide

## ⚠️ CRITICAL: Before Deploying

### 1. **Rotate ALL API Keys**
Your current API keys have been exposed. You MUST rotate them:

- [ ] **Supabase**: Generate new project keys from Supabase dashboard
- [ ] **Gemini API**: Regenerate key from Google AI Studio
- [ ] **Groq API**: Regenerate key from Groq console
- [ ] **Mistral API**: Regenerate key from Mistral console

### 2. **Remove .env from Git History**
Your `.env` files were committed. Clean them:

```bash
# Install BFG Repo Cleaner (recommended)
# Or use git filter-branch
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch backend/.env frontend/.env' \
  --prune-empty --tag-name-filter cat -- --all

# Force push (DANGEROUS - coordinate with team)
git push origin --force --all
```

## 📋 Environment Variables Setup

### Backend Environment Variables
Create these in your production environment (e.g., Heroku, Railway, AWS):

```bash
ENVIRONMENT=production
SUPABASE_URL=<your-new-supabase-url>
SUPABASE_KEY=<your-new-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-new-service-role-key>
GEMINI_API_KEY=<your-new-gemini-key>
GROQ_API_KEY=<your-new-groq-key>
MISTRAL_API_KEY=<your-new-mistral-key>
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### Frontend Environment Variables
Set these during build (e.g., Vercel, Netlify):

```bash
VITE_API_URL=https://your-api-domain.com
VITE_SUPABASE_URL=<your-new-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-new-anon-key>
```

## 🔧 Development Setup

### Backend
```bash
cd backend
cp .env.example .env.local
# Edit .env.local with your development credentials
# Set ENVIRONMENT=development
python run.py
```

### Frontend
```bash
cd frontend
cp .env.example .env.local
# Edit .env.local with your development values
npm run dev
```

## 🐳 Docker Deployment (Recommended)

### Backend Dockerfile
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Don't set ENVIRONMENT here - use environment variables in deployment
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Frontend Dockerfile
```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .

# Build-time environment variables
ARG VITE_API_URL
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🌐 Platform-Specific Guides

### Vercel (Frontend)
1. Connect your GitHub repo
2. Set environment variables in project settings
3. Deploy automatically on push

### Railway (Backend)
1. Create new project from GitHub
2. Set environment variables
3. Deploy automatically

### Heroku (Backend)
```bash
heroku create your-app-name
heroku config:set ENVIRONMENT=production
heroku config:set SUPABASE_URL=...
# Set all other variables
git push heroku main
```

## ✅ Post-Deployment Checklist

- [ ] All API keys rotated
- [ ] Environment variables set correctly
- [ ] ENVIRONMENT=production set
- [ ] CORS origins configured
- [ ] HTTPS enabled
- [ ] Health check endpoint responding: `/health`
- [ ] Error tracking configured (Sentry, etc.)
- [ ] Database backups enabled in Supabase
- [ ] PWA icons generated and working
- [ ] Service worker registered correctly
- [ ] Test all major features in production

## 🔐 Security Hardening

### Additional Recommended Steps:
1. **Add rate limiting at CDN/proxy level** (Cloudflare, etc.)
2. **Enable Supabase RLS policies** (already in schema)
3. **Set up monitoring and alerts** (UptimeRobot, etc.)
4. **Configure Content Security Policy headers**
5. **Enable HSTS headers**
6. **Set up log aggregation** (LogDNA, Papertrail, etc.)

## 📊 Monitoring

### Health Checks
- Backend: `GET /health`
- Should return: `{"status": "healthy", "database": "connected"}`

### Metrics to Monitor:
- API response times
- Error rates
- Database connection pool
- AI API usage and costs
- Rate limit hits

## 🆘 Emergency Rollback

If issues occur:
```bash
# Revert to previous deployment
git revert HEAD
git push origin main

# Or rollback in platform dashboard
```

## 📞 Support

If you need help:
1. Check application logs
2. Verify all environment variables
3. Test health check endpoint
4. Review CORS configuration
