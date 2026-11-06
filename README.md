# VMF Finance Limited — Corporate Website

Official corporate website for **VMF Finance Limited**, a Reserve Bank of India (RBI) registered Non-Banking Financial Company – Investment and Credit Company (NBFC-ICC) established in 1994 in Hyderabad, India.

> **RBI CoR:** N-09.00484 &bull; **CIN:** U67120TG1994PLC168008 &bull; **Estd:** 09 February 1994

---

## 🚀 Keeping the Website Live on Vercel (Continuous Deployment)

The website is fully configured with [`vercel.json`](./vercel.json) for automatic static asset caching, clean URLs, and continuous deployment.

### Step 1: Create a GitHub Repository
1. Go to [github.com/new](https://github.com/new) and create a new repository (e.g., `vmf-finance-website`).
2. Run the following commands in this directory:
   ```bash
   git add .
   git commit -m "feat: complete modern fintech redesign for VMF Finance"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/vmf-finance-website.git
   git push -u origin main
   ```

### Step 2: Connect to Vercel (1-Click Deployment)
1. Go to [vercel.com/new](https://vercel.com/new).
2. Select your GitHub account and click **Import** next to `vmf-finance-website`.
3. Keep the default settings (Framework Preset: **Other** / Static).
4. Click **Deploy**.

🎉 **Your site is now live!** Any future `git push` will automatically trigger an instant production build and deployment on Vercel.

---

## ✨ Design Architecture (Modern Fintech Clean & Corporate)

- **Palette**: Deep Institutional Navy (`#05244F`), Growth Emerald (`#10B981`, `#2D7B39`), Crisp White (`#FFFFFF`), and Slate surfaces (`#F8FAFC`).
- **Typography**: Dual Google Fonts hierarchy with `Plus Jakarta Sans` for display headlines and `DM Sans` for body copy.
- **Glassmorphism**: Multi-layered frosted glass navbar with sticky scroll backdrop blur and pulsing RBI live status beacon.
- **Interactive Working Capital Calculator**: Live instant estimator with dynamic slider for facility ticket size (₹5L to ₹5Cr+), tenor selector (30–120 days), and one-click form pre-filling.
- **Enhanced Product Cards**: 3D elevation cards with feature checklists, advance percentage badges, and direct application routing.
- **6-Step Financing Journey**: Clear milestone timeline with turnaround indicators from KYC to direct account credit within 48 hours.
- **Corporate Governance & Team**: Executive leadership cards with DIN, credentials, and LinkedIn links.
- **Statutory & Regulatory Policies**: Full compliance with RBI guidelines, Fair Practices Code, and Grievance Redressal Mechanism.

---

## 🛠 Local Development & Preview

To preview the website locally:
```bash
# Using Node.js built-in HTTP server:
node -e "const http=require('http'),fs=require('fs'),path=require('path'),mime={'.html':'text/html','.css':'text/css','.js':'application/javascript','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg'};http.createServer((req,res)=>{let f='.'+req.url.split('?')[0];if(f==='./')f='./index.html';fs.readFile(f,(e,c)=>{if(e){res.writeHead(404);res.end('Not Found');return;}res.writeHead(200,{'Content-Type':mime[path.extname(f)]||'text/plain'});res.end(c);});}).listen(3000,()=>console.log('Preview live at http://localhost:3000'));"
```
Or open `index.html` directly in any modern browser.
