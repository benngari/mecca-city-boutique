# Mecca City Boutique — Full-Stack Website

Production-ready Next.js (App Router, JavaScript) e-commerce site for Mecca City Boutique
(Ndagani, Chuka). Includes a public storefront, WhatsApp ordering, and a secure `/admin`
dashboard with full product CRUD backed by MongoDB Atlas and Cloudinary.

## Stack

- Next.js 14 (App Router) + React, JavaScript
- Tailwind CSS
- MongoDB Atlas (via Mongoose)
- Cloudinary (product images)
- JWT session auth (httpOnly cookie) for the admin panel
- Deployable to Vercel

## 1. Install dependencies

```bash
npm install
```

## 2. Create a MongoDB Atlas database

1. Sign up / log in at https://www.mongodb.com/cloud/atlas
2. Create a free (M0) cluster.
3. Database Access → add a database user with a username/password.
4. Network Access → add `0.0.0.0/0` (or Vercel's IPs) so the app can connect.
5. Click **Connect → Drivers**, copy the connection string. It looks like:
   `mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority`
6. Add a database name to the string, e.g. `.../mecca-city-boutique?retryWrites=true...`

## 3. Create a Cloudinary account

1. Sign up at https://cloudinary.com
2. On your Dashboard, copy: **Cloud Name**, **API Key**, **API Secret**.
   Never share the API Secret or commit it to git.

## 4. Configure environment variables

Copy the example file and fill in your real values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `MONGODB_URI` | Your Atlas connection string (from step 2) |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | From your Cloudinary dashboard |
| `JWT_SECRET` | Any long random string — used to sign admin session cookies |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Credentials for the account the seed script creates |
| `NEXT_PUBLIC_SITE_URL` | Your production URL (used for SEO/sitemap) |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Primary WhatsApp number, international format (254...) |
| `NEXT_PUBLIC_WHATSAPP_NUMBER_SECONDARY` | Secondary number, for reference |

## 5. Create the admin account

This runs once (or any time you want to reset the password) and writes a hashed
password into MongoDB — the plaintext password from `.env.local` is never stored.

```bash
npm run create-admin
```

You should see `Admin account ready: <username>`.

## 6. Run locally

```bash
npm run dev
```

- Storefront: http://localhost:3000
- Admin login: http://localhost:3000/admin/login (use the credentials from step 5)

Add a few products from **Admin → Add Product** — the public Shop, Categories and
Home pages read live from MongoDB, so new products appear immediately.

## 7. Deploy to Vercel

1. Push this project to a GitHub repository.
2. In Vercel: **New Project → Import** your repo.
3. Under **Environment Variables**, add every variable from `.env.example` (with your
   real values — same as your `.env.local`).
4. Deploy.
5. After the first deploy, run `npm run create-admin` **locally** (pointed at the same
   `MONGODB_URI` you used on Vercel) to create the admin account in the production
   database — or run it any time you need to reset the admin password.
6. Update `NEXT_PUBLIC_SITE_URL` to your live Vercel/custom domain and redeploy so the
   sitemap and Open Graph tags use the correct URL.

## Project structure

```
app/
  (site)/            Public pages: home, shop, product/[slug], categories, about, contact
  admin/              /admin dashboard, login, product management (protected)
  api/                Route handlers: auth, products CRUD, image upload, categories
  layout.js           Root layout (fonts, global metadata)
  sitemap.js          Dynamic sitemap (static routes + every product)
components/           Shared UI (Navbar, Footer, ProductCard, WhatsAppButton, ...)
components/admin/     Admin-only UI (sidebar, product form, image uploader, stats)
lib/                  mongodb.js, cloudinary.js, auth.js, whatsapp.js, constants.js
models/                Mongoose schemas: Product, Category, Admin
scripts/create-admin.js  One-off script to create/reset the admin account
middleware.js          Protects /admin/* pages and product-mutating /api routes
public/robots.txt
```

## Security notes

- MongoDB credentials and Cloudinary secrets only ever live in environment variables —
  never hard-coded, never sent to the browser.
- Admin passwords are hashed with bcrypt before being stored.
- Admin sessions are httpOnly, signed JWT cookies — inaccessible to client-side JS.
- `middleware.js` blocks any unauthenticated request to `/admin/*` (except `/admin/login`)
  and to the product-mutating and image-upload API routes, redirecting to login (pages)
  or returning `401` (API).
- `/admin` is excluded from `robots.txt` and marked `noindex`.

## WhatsApp ordering

`lib/whatsapp.js` converts local Kenyan numbers (07XXXXXXXX) to the international format
WhatsApp's click-to-chat links require (254XXXXXXXXX) and builds a pre-filled message:

> "Hello Mecca City Boutique, I am interested in [PRODUCT NAME]. Is it available?"

This is used on every product card, the product detail page, and the floating WhatsApp
button that appears on every page.
