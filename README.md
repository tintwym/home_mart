# Home Mart

A modern e-commerce application built with Laravel and React.

## Pushing to GitHub

Your `.env` file is in `.gitignore`, so **it will not be pushed** — only `.env.example` (no secrets) is committed.

1. Create a new repository on GitHub (do **not** add a README or .gitignore).
2. From your project folder:

```bash
git init
git add .
git commit -m "Initial commit: Home Mart e-commerce"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your GitHub username and repo name.  
Anyone who clones the repo will copy `.env.example` to `.env` and add their own keys (database, Stripe, etc.).

## Tech Stack

- **Backend**: Laravel 12 (PHP 8.2+)
- **Frontend**: React 19 with Inertia.js
- **Styling**: Tailwind CSS 4
- **Build Tool**: Vite
- **Database**: PostgreSQL (Neon, local Postgres, etc.); automated tests use SQLite in-memory

## Requirements

- PHP 8.2 or higher
- Composer
- Node.js 22 or higher
- NPM
- PostgreSQL 14+ (local install or Neon; see `.env.example`)

## Local Development Setup

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
```

2. Create a PostgreSQL database named `homemart` (e.g. `createdb homemart`, or use Neon and set `DATABASE_URL` in `.env` before migrating). Defaults match `.env.example`.

3. Install dependencies and setup:
```bash
composer setup
```

This command will:
- Install PHP dependencies
- Create `.env` file from `.env.example`
- Generate application key
- Run database migrations (requires PostgreSQL running and reachable)
- Install Node.js dependencies
- Build frontend assets

4. Start the development server:
```bash
composer dev
```

This runs the Laravel server, queue worker, logs, and Vite dev server concurrently.

## Production Deployment

⚠️ **Important**: This is a full-stack Laravel application that requires a PHP runtime. It **cannot** be deployed as a static-only site (for example GitHub Pages). On **Vercel**, this repo uses the community **`vercel-php`** runtime via `api/index.php` plus `npm run build` for assets (see `vercel.json`).

### Deployment Requirements

Your hosting environment must support:
- PHP 8.2+ with required extensions (including **pdo_pgsql** for PostgreSQL)
- Composer
- Node.js (for building assets)
- PostgreSQL server (or a hosted URI such as Neon)
- Web server (Apache/Nginx)
- SSL certificate (recommended)

### Recommended Deployment Options

1. **Traditional PHP Hosting**
   - Shared hosting with PHP support (cPanel, Plesk)
   - Upload built files to `public_html` or web root
   - Point web server to the `public` directory

2. **Platform as a Service (PaaS)**
   - [Laravel Forge](https://forge.laravel.com) - Official Laravel deployment platform
   - [Laravel Vapor](https://vapor.laravel.com) - Serverless deployment on AWS
   - [Vercel](https://vercel.com) — Laravel via [vercel-community/php](https://github.com/vercel-community/php) (`vercel-php` runtime); use external DB and object storage for uploads
   - [Railway](https://railway.app)
   - [Render](https://render.com)

3. **Virtual Private Server (VPS)**
   - DigitalOcean
   - AWS EC2
   - Linode
   - Vultr

4. **Containerized Deployment**
   - Docker with Docker Compose
   - Kubernetes

### Deployment Steps

1. **Build production assets:**
```bash
npm install
npm run build
```

2. **Optimize for production:**
```bash
composer install --optimize-autoloader --no-dev
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

3. **Set environment variables:**
   - Copy `.env.example` to `.env`
   - Set `APP_ENV=production`
   - Set `APP_DEBUG=false`
   - Configure database credentials
   - Generate `APP_KEY` with `php artisan key:generate`
   - Set correct `APP_URL`

4. **Image storage (production):**
   - **Local disk (default):** Images are stored under `storage/app/public/listings/` and served via `public/storage` (run `php artisan storage:link`). This is fine for a single server with a persistent filesystem.
  - **Ephemeral/serverless filesystems (including Vercel):** local uploads may be lost between deployments or instances. Set `LISTING_FILESYSTEM_DISK=s3`, then set `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_DEFAULT_REGION`, and `AWS_BUCKET` (and optionally `AWS_URL` for a custom bucket URL). Listing images will then be stored in S3 and persist across deploys.

5. **Run migrations:**
```bash
php artisan migrate --force
```

6. **Configure web server:**
   - Point document root to `/public` directory
   - Configure URL rewriting (Laravel includes `.htaccess` for Apache)
   - Set proper file permissions (storage and bootstrap/cache should be writable)

### Deploy to Vercel

This repo includes **`api/index.php`** (loads `public/index.php`) and **`vercel.json`** with the **`vercel-php@0.8.0`** runtime, **`outputDirectory`: `public`**, and routes so Vite assets under `/build` are served and other requests hit the PHP function. **`.vercelignore`** excludes `vendor/` so dependencies are installed on Vercel during the PHP build.

1. **Create a Vercel project**
   - Import your GitHub repo; root directory `./`.
   - Set framework to **Other** if the dashboard does not auto-detect Laravel correctly (so `installCommand` / `buildCommand` from `vercel.json` apply).

2. **Environment variables** (Project Settings → Environment Variables)
   - `APP_KEY` — `php artisan key:generate --show` locally.
   - `APP_ENV=production`, `APP_DEBUG=false`
   - `APP_URL=https://<your-vercel-domain>`
   - `DATABASE_URL` — PostgreSQL URI (e.g. Neon `postgresql://…?sslmode=require`).
   - Recommended on serverless: `LOG_CHANNEL=stderr`, `CACHE_STORE=array`, `SESSION_DRIVER=cookie` (adjust if you use Redis/database elsewhere).
   - `STRIPE_*`, Cloudinary/S3 vars if you use them.

3. **Build**
   - `vercel.json` runs `npm ci` then `npm run build` so `public/build` exists on deploy.
   - **Wayfinder:** `resources/js/routes` and `resources/js/wayfinder` are committed so Vite can resolve `@/routes/*` without PHP during the Node build. After you add or change Laravel routes, run `php artisan wayfinder:generate` and commit the updated files.

4. **Migrations**
   - Run `php artisan migrate --force` from a machine (or CI) that can reach production `DATABASE_URL`.

5. **Uploads**
   - Use `LISTING_FILESYSTEM_DISK=cloudinary` or `s3`; the serverless filesystem is not durable.

**Troubleshooting:** If you see `could not find driver` for `pgsql`, the PHP runtime is missing `pdo_pgsql`. On Vercel, use a PHP build that includes PostgreSQL support. If production still uses SQLite, set `DATABASE_URL` (or `DB_CONNECTION=pgsql` and `DB_*`) to your PostgreSQL service.

### Domain Configuration

If deploying to `www.homemart.com.mm` (or your own domain):
- Configure DNS A/CNAME records to point to your server IP
- Set `APP_URL=https://www.homemart.com.mm` in `.env` (match your live URL)
- Configure SSL certificate (Let's Encrypt recommended)

## Testing

Run the test suite:
```bash
composer test
```

This will:
- Run PHP linting with Pint
- Run PHPUnit tests

## Code Quality

- **PHP Linting**: `composer lint`
- **Frontend Formatting**: `npm run format`
- **Frontend Linting**: `npm run lint`
- **Type Checking**: `npm run types`

## License

MIT
