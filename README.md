# Mitra TCG

A fullstack e-commerce platform for One Piece & Pokémon trading cards (English Raw & Graded). Built with Next.js 16 App Router, PostgreSQL via Prisma, and Google Cloud Storage.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5 (strict) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Database | PostgreSQL + Prisma 7 |
| Auth | NextAuth v5 (JWT, credentials) |
| Storage | Google Cloud Storage |
| State | TanStack Query v5 + Zustand |
| Forms | React Hook Form + Zod v4 |
| Testing | Vitest + Playwright |

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database
- Google Cloud Storage bucket

### Environment Variables

Create a `.env` file:

```env
DATABASE_URL="postgresql://..."
AUTH_SECRET="..."
AUTH_URL="http://localhost:3000"

GCS_PROJECT_ID="..."
GCS_BUCKET_NAME="..."
GCS_CLIENT_EMAIL="..."
GCS_PRIVATE_KEY="..."

NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_WHATSAPP_URL="https://wa.me/..."

ADMIN_EMAIL="..."
ADMIN_PASSWORD="..."
```

### Setup

```bash
npm install

# Push schema to database
npm run db:push

# Seed initial data
npm run db:seed

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/
│   ├── (marketing)/        # Public site: /, /products, /about, /contact
│   ├── (dashboard)/        # Admin UI: /dashboard/**  (auth-protected)
│   ├── api/                # Route handlers: auth, contact, upload
│   └── login/              # Auth page
├── components/
│   ├── ui/                 # shadcn base components
│   ├── layout/             # Header, footer, sidebar, mobile nav
│   ├── products/           # Product card, grid, filters, gallery
│   ├── dashboard/          # Data table, stats card, image uploader, hero picker
│   └── shared/             # Confirm dialog, error boundary, spinner
├── features/               # Feature modules (actions, services, repositories, schemas)
│   ├── auth/
│   ├── products/
│   ├── categories/
│   ├── media/              # GCS upload/delete logic (no dashboard page — inline upload only)
│   ├── contact/
│   └── settings/
├── lib/                    # Prisma client, auth config, GCS, utils
├── config/                 # Site config, nav routes
├── providers/              # QueryProvider, ThemeProvider
├── hooks/                  # Custom React hooks
├── types/                  # Shared TypeScript types
└── middleware.ts           # Auth guard for /dashboard routes
```

## Database Scripts

```bash
npm run db:generate     # Generate Prisma client
npm run db:push         # Push schema to DB (dev, no migration)
npm run db:migrate      # Create and run migration
npm run db:studio       # Open Prisma Studio
npm run create-admin    # Create admin user from CLI
```

## Feature Architecture

Each feature module follows a consistent pattern:

```
features/[feature]/
├── actions.ts          # Server actions
├── schemas.ts          # Zod validation
├── services.ts         # Business logic
├── repositories.ts     # Prisma queries
├── types.ts            # TypeScript types
└── components/         # Feature UI components
```

## User Roles

| Role | Access |
|---|---|
| `ADMIN` | Full access: products, categories, contacts, settings, user management |
| `EDITOR` | Products, categories |

## Key URLs

| Path | Description |
|---|---|
| `/` | Marketing homepage |
| `/products` | Public product catalog |
| `/products/[slug]` | Product detail page |
| `/about` | About page |
| `/contact` | Contact form |
| `/login` | Admin login |
| `/dashboard` | Admin overview |
| `/dashboard/products` | Product CRUD |
| `/dashboard/categories` | Category management |
| `/dashboard/contacts` | Contact submissions |
| `/dashboard/settings` | Site settings, hero background images |
