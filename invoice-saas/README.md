# BillFlow

India-first invoice SaaS. Create professional invoices. Get paid faster.

## Current milestone

Sprint 1 — project foundation and invoice-first architecture.

## Repository

- `apps/web` — Next.js web application
- `apps/api` — Node.js + Express API
- `packages/types` — shared domain types
- `packages/validation` — shared validation schemas
- `packages/invoice-engine` — authoritative invoice calculations
- `packages/ui` — shared UI primitives
- `docs` — product, architecture, security, legal and testing source of truth
- `tasks` — small verifiable work items

## Start

```bash
npm install
npm run dev:web
```

API:

```bash
npm run dev:api
```

Copy `.env.example` to `.env` before connecting external services.
