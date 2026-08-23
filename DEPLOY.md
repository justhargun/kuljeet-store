# Deploying Kuljeet Store to Vercel

This folder is a complete, ready-to-run project (Vite + React). No coding
needed to deploy it — just follow one of the two paths below.

## Before you deploy: fill in your keys
Open `src/App.jsx`, find these lines near the top, and fill in whichever
you're ready to use (leave the rest blank for now, it's safe):
```js
const SUPABASE_URL = '';
const SUPABASE_ANON_KEY = '';
const RAZORPAY_KEY_ID = '';
```
This is a static site — these values get baked in at build time, so if you
change them later you'll need to redeploy (Vercel makes this a single click,
see below).

## Path A — GitHub + Vercel dashboard (recommended, easiest to update later)
1. Create a free account at **github.com** if you don't have one.
2. Create a new repository (e.g. `kuljeet-store`), then upload this entire
   folder's contents to it — either drag-and-drop the files on the GitHub
   website, or if you're comfortable with a terminal:
   ```
   git init
   git add .
   git commit -m "Kuljeet Store"
   git branch -M main
   git remote add origin https://github.com/<your-username>/kuljeet-store.git
   git push -u origin main
   ```
3. Go to **vercel.com** → sign up/log in (you can sign in directly with your
   GitHub account) → **Add New → Project**.
4. Select your `kuljeet-store` repo → Vercel auto-detects it's a Vite app →
   click **Deploy**.
5. In ~1 minute you'll get a live URL like `kuljeet-store.vercel.app`.
6. Any time you want to change something later (prices, settings in code,
   new keys), edit the file on GitHub (or push a new commit) — Vercel
   redeploys automatically.

## Path B — Vercel CLI (fastest one-time deploy, no GitHub needed)
Needs Node.js installed on your computer (nodejs.org).
1. Open a terminal in this folder.
2. Run:
   ```
   npm install
   npx vercel
   ```
3. Follow the prompts (log in with email or GitHub when asked).
4. For future updates, edit files then run:
   ```
   npx vercel --prod
   ```

## Adding your own domain (e.g. kuljeetstore.com)
1. Buy a domain from any registrar (GoDaddy, Namecheap, Google Domains, etc.)
2. In your Vercel project → **Settings → Domains** → add your domain.
3. Vercel shows you 1–2 DNS records to add at your registrar. Add them there
   — usually live within a few minutes to a few hours.

## Testing locally before you deploy (optional)
```
npm install
npm run dev
```
Opens the store at `http://localhost:5173` on your own computer.
