# 🚀 TravelComp Deployment Guide

This guide walks you through deploying the TravelComp application to production.

## Table of Contents

- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Railway.app Deployment](#railwayapp-deployment)
- [Render.com Deployment](#rendercom-deployment)
- [Environment Variables](#environment-variables)
- [Database Migration](#database-migration)
- [Post-Deployment Testing](#post-deployment-testing)
- [Custom Domain Setup](#custom-domain-setup)
- [Monitoring and Maintenance](#monitoring-and-maintenance)

## Pre-Deployment Checklist

Before deploying to production, ensure you have:

- ✅ Tested the application locally
- ✅ All environment variables documented
- ✅ Database schema is finalized
- ✅ API key from AviationStack (optional but recommended)
- ✅ Git repository is clean and committed
- ✅ Security headers configured (Helmet.js)
- ✅ Rate limiting enabled
- ✅ CORS configured for production domain

## Railway.app Deployment

Railway offers simple deployment with automatic HTTPS and scaling.

### Step 1: Sign Up and Connect

1. Go to [Railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Authorize Railway to access your repository
6. Select the `Flight-delays` repository

### Step 2: Configure Build Settings

Railway auto-detects Node.js projects. Verify:

- **Build Command**: `npm install` (auto-detected)
- **Start Command**: `node server.js` (auto-detected from package.json)
- **Root Directory**: `/` (default)

### Step 3: Set Environment Variables

In Railway dashboard, go to **Variables** tab and add:

```env
NODE_ENV=production
PORT=3001
AVIATION_API_KEY=your_aviationstack_api_key
DATABASE_URL=./travelcomp.db
JWT_SECRET=your-secure-random-secret-key
```

To generate a secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Step 4: Deploy

1. Click **Deploy**
2. Railway will build and deploy automatically
3. You'll get a URL like: `https://your-app.up.railway.app`

### Step 5: Enable PostgreSQL (Optional)

For production with multiple instances:

1. In Railway dashboard, click **New** → **Database** → **PostgreSQL**
2. Railway will provision a database and add `DATABASE_URL` automatically
3. Update your `database.js` to support PostgreSQL:

```javascript
// Add at top of database.js
const isProduction = process.env.NODE_ENV === 'production';
const usePostgres = process.env.DATABASE_URL?.includes('postgres');

// Modify database initialization based on environment
```

### Step 6: Configure Domain

1. Go to **Settings** → **Domains**
2. Add custom domain or use Railway subdomain
3. Railway automatically provisions SSL certificate

## Render.com Deployment

Render provides free tier with auto-deploy from GitHub.

### Step 1: Create Web Service

1. Go to [Render.com](https://render.com)
2. Sign up with GitHub
3. Click **New** → **Web Service**
4. Connect your GitHub repository
5. Select `Flight-delays` repository

### Step 2: Configure Service

Fill in the configuration:

**General:**
- **Name**: `travelcomp`
- **Region**: Choose closest to your users
- **Branch**: `main` or your deployment branch
- **Root Directory**: (leave empty)

**Build & Deploy:**
- **Build Command**: `npm install`
- **Start Command**: `node server.js`

**Plan:**
- Select **Free** tier (or paid for production)

### Step 3: Environment Variables

Click **Environment** and add variables:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `3001` |
| `AVIATION_API_KEY` | Your AviationStack API key |
| `DATABASE_URL` | `./travelcomp.db` |
| `JWT_SECRET` | Your secure secret |

### Step 4: Deploy

1. Click **Create Web Service**
2. Render will build and deploy automatically
3. You'll get a URL like: `https://travelcomp.onrender.com`

### Step 5: Add PostgreSQL Database (Optional)

1. Go to Dashboard → **New** → **PostgreSQL**
2. Name it (e.g., `travelcomp-db`)
3. Create database
4. In your web service, add environment variable:
   - **Key**: `DATABASE_URL`
   - **Value**: Internal database URL from PostgreSQL service

### Step 6: Configure Custom Domain

1. Go to **Settings** → **Custom Domain**
2. Add your domain
3. Configure DNS with the provided CNAME record
4. SSL is automatic

## Environment Variables

### Required Variables

```env
# Server Configuration
NODE_ENV=production          # Must be 'production' for deployment
PORT=3001                    # Port for the server

# Database
DATABASE_URL=./travelcomp.db # Path to SQLite or PostgreSQL URL

# API Keys
AVIATION_API_KEY=xxx         # AviationStack API key (get from aviationstack.com)

# Security
JWT_SECRET=xxx               # Random secret for JWT tokens
```

### Optional Variables

```env
# Email (for future notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# SMS (for future notifications)
TWILIO_ACCOUNT_SID=xxx
TWILIO_AUTH_TOKEN=xxx

# Monitoring
SENTRY_DSN=xxx              # For error tracking
```

## Database Migration

### SQLite to PostgreSQL Migration

If you need to migrate from SQLite to PostgreSQL:

1. **Install PostgreSQL locally** (for testing)
   ```bash
   # macOS
   brew install postgresql

   # Ubuntu
   sudo apt-get install postgresql
   ```

2. **Update database.js** to support both:
   ```javascript
   const isPg = process.env.DATABASE_URL?.includes('postgres');

   const db = isPg
     ? require('pg') // Add pg package
     : new Database(DATABASE_URL);
   ```

3. **Export SQLite data**
   ```bash
   sqlite3 travelcomp.db .dump > backup.sql
   ```

4. **Import to PostgreSQL**
   ```bash
   psql $DATABASE_URL < backup.sql
   ```

### Backup Strategy

**Automated Backups:**

1. **Railway**: Automatic daily backups (paid plan)
2. **Render**: Database backups available (paid plan)
3. **Manual**: Schedule cron job to backup database

```bash
# Add to crontab (crontab -e)
0 0 * * * cd /path/to/app && sqlite3 travelcomp.db .dump > backups/backup-$(date +\%Y\%m\%d).sql
```

## Post-Deployment Testing

### 1. Health Check

```bash
curl https://your-app.com/api/health
```

Expected response:
```json
{"success":true,"status":"healthy","timestamp":"..."}
```

### 2. Test Flight Search

```bash
curl "https://your-app.com/api/test-scenario/delayed_3h"
```

### 3. Test Claim Submission

```bash
curl -X POST https://your-app.com/api/claims \
  -H "Content-Type: application/json" \
  -d '{"flightNumber":"BA123","flightDate":"2024-11-10","airline":"British Airways","departure":"LHR","arrival":"JFK","issueType":"delay","delayMinutes":240}'
```

### 4. Test Frontend

1. Visit `https://your-app.com`
2. Try test scenarios
3. Submit a claim
4. Check PWA installation on mobile

### 5. Check Logs

**Railway:**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and view logs
railway login
railway logs
```

**Render:**
View logs in the Render dashboard under **Logs** tab

## Custom Domain Setup

### Step 1: Purchase Domain

Purchase from:
- Namecheap
- Google Domains
- Cloudflare

### Step 2: Configure DNS

**For Railway:**
1. Add CNAME record:
   ```
   Type: CNAME
   Name: @ or www
   Value: your-app.up.railway.app
   ```

**For Render:**
1. Add CNAME record:
   ```
   Type: CNAME
   Name: @ or www
   Value: provided by Render
   ```

### Step 3: Update Application

1. Update CORS settings in `server.js`:
   ```javascript
   const allowedOrigins = [
     'https://yourdomain.com',
     'https://www.yourdomain.com'
   ];

   app.use(cors({
     origin: allowedOrigins
   }));
   ```

2. Update manifest.json URLs
3. Redeploy

## Monitoring and Maintenance

### Error Tracking with Sentry

1. **Sign up** at [Sentry.io](https://sentry.io)

2. **Install SDK**
   ```bash
   npm install @sentry/node
   ```

3. **Add to server.js**
   ```javascript
   const Sentry = require('@sentry/node');

   Sentry.init({
     dsn: process.env.SENTRY_DSN,
     environment: process.env.NODE_ENV
   });

   // Add before route handlers
   app.use(Sentry.Handlers.requestHandler());

   // Add before error handlers
   app.use(Sentry.Handlers.errorHandler());
   ```

### Uptime Monitoring

Use free services:
- **UptimeRobot**: https://uptimerobot.com
- **Pingdom**: https://pingdom.com
- **StatusCake**: https://statuscake.com

Configure to check:
```
https://your-app.com/api/health
```

Every 5 minutes, alert if down.

### Performance Monitoring

**Add logging:**

```javascript
// In server.js
const morgan = require('morgan');
app.use(morgan('combined'));
```

**Monitor metrics:**
- Response times
- Error rates
- API call volumes
- Database query performance

### Database Maintenance

**SQLite:**
```bash
# Vacuum database periodically
sqlite3 travelcomp.db 'VACUUM;'

# Check integrity
sqlite3 travelcomp.db 'PRAGMA integrity_check;'
```

**PostgreSQL:**
```sql
-- Auto-vacuum enabled by default
-- Check database size
SELECT pg_size_pretty(pg_database_size('database_name'));
```

## Security Best Practices

### 1. HTTPS Only

Ensure all traffic uses HTTPS (Railway and Render provide this automatically).

### 2. Environment Variables

Never commit `.env` file. Use platform's secret management.

### 3. Rate Limiting

Already configured in `server.js`:
```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
```

### 4. Security Headers

Already configured with Helmet.js:
```javascript
app.use(helmet());
```

### 5. CORS Configuration

Update for production domain:
```javascript
app.use(cors({
  origin: 'https://yourdomain.com'
}));
```

## Scaling Considerations

### Horizontal Scaling

**Railway**: Automatically scales with traffic (paid plan)

**Render**: Configure replicas in dashboard

### Database Scaling

For high traffic:
1. Migrate to PostgreSQL
2. Add read replicas
3. Implement caching (Redis)

### CDN for Static Files

Use CDN for faster global access:
1. Cloudflare (free tier available)
2. AWS CloudFront
3. Fastly

## Troubleshooting Deployment

### Build Fails

**Check:**
- Node version matches (>= 16.0.0)
- All dependencies in package.json
- Build command is correct

**Fix:**
```bash
# Test build locally
npm install
node server.js
```

### Database Connection Errors

**Check:**
- DATABASE_URL is set correctly
- Database file is writable (SQLite)
- Connection string is valid (PostgreSQL)

### API Errors

**Check:**
- AVIATION_API_KEY is set
- API key is valid
- Rate limits not exceeded

### CORS Errors

**Fix:**
```javascript
// Allow specific origins
app.use(cors({
  origin: ['https://yourdomain.com', 'https://www.yourdomain.com']
}));
```

## Rollback Strategy

### Railway

```bash
# Via CLI
railway rollback

# Or via dashboard
# Go to Deployments → Select previous deployment → Redeploy
```

### Render

In dashboard:
1. Go to **Deployments**
2. Find previous successful deployment
3. Click **Redeploy**

## Cost Estimation

### Free Tier Limits

**Railway:**
- $5 free credit/month
- ~500 hours execution time
- 100GB bandwidth

**Render:**
- Free web service (spins down after inactivity)
- 400 build hours/month
- Slower performance

### Paid Plans

**Railway:**
- **Hobby**: $5/month
- **Pro**: $20/month

**Render:**
- **Starter**: $7/month
- **Standard**: $25/month

## Support

For deployment issues:
- Railway: https://docs.railway.app
- Render: https://render.com/docs
- GitHub Issues: Create issue in repository

---

**Good luck with your deployment! 🚀**
