# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Ecom Libya Store — a full Arabic RTL e-commerce platform for the Libyan market with cash-on-delivery (الدفع عند الاستلام).

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM (local), Supabase (orders)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Tailwind CSS v4 (RTL Arabic, Tajawal font)
- **Routing**: wouter v3 (flat Switch, no nested routers)
- **IMPORTANT**: `artifacts/ecom-libya/index.html` must remain the clean Vite entry point (`<script type="module" src="/src/main.tsx">`). The original 1803-line Babel/CDN HTML was replaced — do NOT restore inline scripts.

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server (port 8080)
│   └── ecom-libya/         # React frontend (Arabic RTL, port 22037)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/
│   └── src/seed.ts         # Seed categories and products (286 products)
```

## Ecom Libya Store — Key Files

- `src/lib/store-context.tsx` — Global StoreProvider (cart, wishlist, coupon, checkout, admin, orders)
- `src/lib/supabase.ts` — Supabase client + WHATSAPP_NUMBER, ADMIN_PASSWORD, COUPON_CODE constants
- `src/App.tsx` — Flat wouter Switch routing (no nested routers)
- `src/pages/Admin.tsx` — Admin panel (Supabase orders, CSV export, WhatsApp, status management)
- `src/pages/Checkout.tsx` — Checkout form → Supabase insert → redirect to /order-success
- `src/pages/Cart.tsx` — localStorage cart with coupon "خصم10" (10%)
- `src/pages/Wishlist.tsx` — localStorage wishlist
- `src/components/ProductCard.tsx` — Store-connected card with wishlist + "اطلب الآن" CTA
- `src/components/layout/Navbar.tsx` — Store-connected navbar with cart/wishlist counts

## Features

- **Homepage**: Hero image, category grid, featured products, trust badges, WhatsApp CTA
- **Products**: 286 real seeded products — searchable/filterable, discount %, rating stars
- **Cart**: localStorage-based (key `"cart"`), coupon `"خصم10"` = 10% off
- **Wishlist**: localStorage-based (key `"wishlist"`)
- **Product Detail**: "اطلب الآن - الدفع عند الاستلام" CTA + add-to-cart + WhatsApp inquiry
- **Checkout**: Arabic form (name, phone, city) → Supabase insert + redirect to /order-success
- **Admin**: Password `LibyaStore@2026` — Supabase orders management, CSV export, WhatsApp
- **Account**: Account page UI (login/signup form, display only)
- **RTL**: Full Arabic RTL layout with Tajawal font

## Color Palette (index.css)

- **Primary**: `#1d4ed8` (deep professional blue) — buttons, links, badges
- **Background**: `#f8fafc` (slate-50) — clean neutral
- **Surface**: `#ffffff` — cards, panels
- **Text**: `#0f172a` (slate-900) — primary text
- **Muted**: `#64748b` (slate-500) — secondary text

## Constants (supabase.ts)

- `SUPABASE_URL`: `https://wkwyvlrkjpecwiwmxlcw.supabase.co`
- `SUPABASE_KEY`: `sb_publishable_z-Rmb1bXxAUGcfgf5dnZwg_xMh6ACqT`
- `WHATSAPP_NUMBER`: `212765074750`
- `ADMIN_PASSWORD`: `LibyaStore@2026`
- `COUPON_CODE`: `خصم10` (10% discount)
- `SHIPPING_COST`: 10 LYD

## Product Images

- 100 real product images in `public/img/`
- All 286 products seeded from original HTML with correct `img/filename.ext` paths
- Products without images show Arabic name initials as fallback

## Routes

- `/` — Home
- `/products` — Products catalog
- `/products/:id` — Product detail
- `/cart` — Cart (localStorage)
- `/checkout` — Checkout form → Supabase
- `/order-success` — Order confirmation (with `?id=ORD-xxx`)
- `/wishlist` — Wishlist (localStorage)
- `/account` — Account page
- `/admin` — Admin panel (no layout)

## Database Tables (PostgreSQL/Drizzle)

- `categories` — product categories (Arabic + English names)
- `products` — 286 products with Arabic names, prices, badge, stock, featured flag
- `cart_items` — session-based cart (legacy, now using localStorage)
- `orders` — customer orders
- `order_items` — individual items per order

## API Endpoints

- `GET /api/products` — list with search/category/price filters
- `GET /api/products/featured` — featured products for homepage
- `GET /api/products/:id` — single product
- `GET /api/categories` — categories list
- `GET /api/admin/stats` — dashboard statistics

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly`
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API client/zod from openapi.yaml
- `pnpm --filter @workspace/db run push` — push schema changes to DB
- `pnpm --filter @workspace/scripts run seed` — populate 286 products + categories
