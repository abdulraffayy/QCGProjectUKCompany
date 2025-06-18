# Static Deployment Guide - QAQF Academic Content Platform

## Building Static Frontend

### 1. Build Production Version
```bash
npm run build
```
This creates a `dist` folder with static files.

### 2. Preview Static Build
```bash
npm run preview
```

## Static Hosting Options

### Option 1: Netlify
1. Sign up at [netlify.com](https://netlify.com)
2. Connect your GitHub repository
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Deploy automatically on push

### Option 2: Vercel
1. Sign up at [vercel.com](https://vercel.com)
2. Import your project
3. Vercel auto-detects Vite configuration
4. Deploy with one click

### Option 3: GitHub Pages
1. Install gh-pages: `npm install --save-dev gh-pages`
2. Add to `package.json`:
```json
{
  "scripts": {
    "deploy": "gh-pages -d dist"
  },
  "homepage": "https://yourusername.github.io/repository-name"
}
```
3. Deploy: `npm run deploy`

### Option 4: AWS S3 + CloudFront
1. Create S3 bucket with static website hosting
2. Upload `dist` folder contents
3. Configure CloudFront for global CDN
4. Set up custom domain (optional)

## Backend API Deployment

### Option 1: Railway
1. Sign up at [railway.app](https://railway.app)
2. Connect GitHub repository
3. Add PostgreSQL database service
4. Deploy Python backend automatically

### Option 2: Render
1. Sign up at [render.com](https://render.com)
2. Create new Web Service
3. Connect repository, select `python_backend` folder
4. Add PostgreSQL database
5. Set environment variables

### Option 3: Heroku
1. Install Heroku CLI
2. Create `Procfile` in `python_backend`:
```
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```
3. Deploy:
```bash
heroku create your-app-name
git subtree push --prefix python_backend heroku main
```

## Environment Variables for Production

### Frontend (.env.production)
```env
VITE_API_BASE_URL=https://your-backend-api.com
VITE_APP_TITLE=QAQF Academic Content Platform
```

### Backend (Production Environment)
```env
DATABASE_URL=postgresql://user:pass@host:port/db
CORS_ORIGINS=["https://your-frontend-domain.com"]
ENVIRONMENT=production
```

## Static Build Optimizations

### 1. Code Splitting
Already configured in Vite for automatic code splitting.

### 2. Asset Optimization
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-button']
        }
      }
    }
  }
})
```

### 3. Compression
Add to build process:
```bash
npm install --save-dev vite-plugin-compression
```

## SEO and Performance

### 1. Meta Tags
Already configured in `index.html`:
- Title tags
- Open Graph tags
- Meta descriptions

### 2. Lighthouse Score Optimization
- Images are optimized (SVG icons)
- CSS is bundled and minified
- JavaScript is code-split
- No unused dependencies

## Security Considerations

### 1. Environment Variables
- Never expose API keys in frontend
- Use backend proxy for sensitive API calls

### 2. CORS Configuration
```python
# python_backend/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-domain.com"],  # Specific domains only
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)
```

### 3. HTTPS Only
- Always use HTTPS in production
- Set secure cookie flags
- Enable HSTS headers

## Monitoring and Analytics

### 1. Error Tracking
Consider adding Sentry:
```bash
npm install @sentry/react
```

### 2. Analytics
Add Google Analytics or Plausible for usage tracking.

### 3. Performance Monitoring
Use Web Vitals for performance metrics.

## Maintenance

### 1. Dependencies
- Regular security updates: `npm audit fix`
- Update dependencies: `npm update`

### 2. Database Backups
- Automated daily backups
- Point-in-time recovery setup

### 3. Monitoring
- Uptime monitoring
- Error rate tracking
- Performance metrics