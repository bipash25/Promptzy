# 🌐 Promptzy Web - Build Instructions

## 🚀 Quick Start (Development)

```powershell
cd C:\Users\Administrator\Desktop\Projects\Promptzy\packages\web
npm run dev
```

Open: http://localhost:3000

---

## 📦 **Production Build**

### **Step 1: Build for Production**
```powershell
cd packages/web
npm run build
```

This creates an optimized build in the `dist/` folder.

### **Step 2: Preview Production Build**
```powershell
npm run preview
```

Test the production build locally before deployment.

---

## 🌍 **Deployment Options**

### **Option 1: Vercel (Recommended)**

1. Install Vercel CLI:
```powershell
npm install -g vercel
```

2. Deploy:
```powershell
cd packages/web
vercel
```

3. Follow prompts to complete deployment

**Production URL:** `https://promptzy.vercel.app`

---

### **Option 2: Netlify**

1. Install Netlify CLI:
```powershell
npm install -g netlify-cli
```

2. Deploy:
```powershell
cd packages/web
netlify deploy --prod
```

**Build settings:**
- Build command: `npm run build`
- Publish directory: `dist`

---

### **Option 3: GitHub Pages**

1. Update `vite.config.js`:
```javascript
export default defineConfig({
  base: '/promptzy/', // Your repo name
  // ... rest of config
});
```

2. Build and deploy:
```powershell
npm run build
npx gh-pages -d dist
```

---

### **Option 4: Self-Hosted (Docker)**

Create `Dockerfile`:
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:
```powershell
docker build -t promptzy-web .
docker run -p 80:80 promptzy-web
```

---

## 🔧 **Build Configuration**

### **Environment Variables**

Create `.env.production`:
```env
VITE_SUPABASE_URL=https://onawxepwcyljveyauiau.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-key-here
```

⚠️ **Never commit production keys to Git!**

---

## 📊 **Build Optimization**

### **Analyze Bundle Size**
```powershell
npm run build -- --mode analyze
```

### **Reduce Bundle Size:**

1. **Code Splitting:**
```javascript
// Use dynamic imports
const EditorPage = lazy(() => import('./pages/EditorPage'));
```

2. **Tree Shaking:**
- Import only what you need
- Remove unused dependencies

3. **Compression:**
```javascript
// vite.config.js
import compression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    react(),
    compression({ algorithm: 'gzip' }),
  ],
});
```

---

## 🎯 **Performance Checklist**

After building, verify:
- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3.5s
- [ ] Bundle size < 500KB (gzipped)
- [ ] Images optimized
- [ ] Fonts preloaded
- [ ] No console errors

---

## 🐛 **Troubleshooting**

### **Issue: Build fails with "out of memory"**
```powershell
$env:NODE_OPTIONS="--max_old_space_size=4096"
npm run build
```

### **Issue: Environment variables not working**
- Ensure variables start with `VITE_`
- Restart dev server after changing `.env`
- Check `import.meta.env.VITE_*` in code

### **Issue: White screen after deployment**
- Check browser console for errors
- Verify base URL in vite.config.js
- Ensure Supabase URL is correct

### **Issue: Tailwind styles not working**
- Run: `npm install -D tailwindcss postcss autoprefixer`
- Verify `postcss.config.js` exists
- Check `index.css` has @tailwind directives

---

## 📁 **Build Output Structure**

```
dist/
├── index.html              # Entry point
├── assets/
│   ├── index-[hash].js    # Main bundle
│   ├── index-[hash].css   # Styles
│   └── *.woff2            # Fonts
└── favicon.ico            # Icon
```

---

## 🔒 **Security Best Practices**

### **Before Production:**

1. **Hide sensitive data:**
   - Never expose Supabase service key
   - Use anon key only in frontend
   - Enable RLS in Supabase

2. **Set up CORS:**
```javascript
// In Supabase dashboard
// Settings → API → CORS
// Add your domain: https://promptzy.vercel.app
```

3. **Enable HTTPS:**
   - Most hosts provide free SSL
   - Redirect HTTP to HTTPS

4. **Set CSP headers:**
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self' 'unsafe-inline'">
```

---

## 🚀 **Continuous Deployment**

### **Setup Auto-Deploy with Vercel + GitHub:**

1. Connect GitHub repo to Vercel
2. Push to `main` branch
3. Vercel automatically builds and deploys
4. Get preview URLs for PRs

### **GitHub Actions (Alternative):**

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production
on:
  push:
    branches: [main]
jobs:
  build-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: npm ci
        working-directory: packages/web
      - run: npm run build
        working-directory: packages/web
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: packages/web/dist
```

---

## 📈 **Monitoring**

### **Add Analytics:**

```javascript
// src/main.jsx
import { inject } from '@vercel/analytics';

inject(); // Vercel Analytics

// Or use Google Analytics
import ReactGA from 'react-ga4';
ReactGA.initialize('G-XXXXXXXXXX');
```

### **Error Tracking:**

```javascript
// Install Sentry
npm install @sentry/react

// src/main.jsx
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: import.meta.env.MODE,
});
```

---

## 🎨 **Custom Domain**

### **Add custom domain to Vercel:**

1. Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain: `promptzy.com`
3. Update DNS records as shown
4. Wait for SSL certificate (automatic)

### **DNS Records:**
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME  
Name: www
Value: cname.vercel-dns.com
```

---

## 📝 **Build Checklist**

Before deploying to production:

- [ ] All features tested locally
- [ ] No console errors or warnings
- [ ] Environment variables configured
- [ ] Supabase RLS policies enabled
- [ ] API keys secured (no service key in frontend)
- [ ] Lighthouse audit passed
- [ ] Mobile responsive tested
- [ ] Dark mode working
- [ ] All links working
- [ ] 404 page created
- [ ] Favicon added
- [ ] Meta tags for SEO
- [ ] Analytics configured
- [ ] Error tracking setup

---

## 🌟 **Next Steps**

1. Deploy to staging environment first
2. Test thoroughly on staging
3. Get feedback from users
4. Deploy to production
5. Monitor performance and errors
6. Iterate based on user feedback

---

## 📞 **Support**

Having issues? Check:
- Vite docs: https://vitejs.dev
- React docs: https://react.dev
- Supabase docs: https://supabase.com/docs
- Vercel docs: https://vercel.com/docs

---

**Happy Deploying! 🚀**