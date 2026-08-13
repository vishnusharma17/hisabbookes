# Architecture

## Stack

- Web: Next.js
- API: Node.js + Express
- Database: PostgreSQL
- Storage: S3-compatible private object storage
- Auth: email/password initially
- Email: transactional email provider
- Payments: established payment gateway; no card data stored by BillFlow

## Monorepo

```text
apps/web
apps/api
packages/types
packages/validation
packages/invoice-engine
packages/ui
```

## Core architectural rules

1. The backend is authoritative for invoice totals.
2. Invoice calculation logic lives in `packages/invoice-engine`.
3. Frontend must not be the source of truth for financial calculations.
4. Tax rules must be isolated and versionable.
5. Finalized invoices are historical financial records and cannot be silently overwritten.
6. Every protected resource must verify ownership/authorization server-side.
7. Invoice PDFs are private objects and should be served through authenticated, short-lived signed URLs.
8. Payment state is updated from verified server-side gateway webhooks.
9. Database changes use migrations.
10. Architecture changes update this document and `docs/DECISIONS.md`.
