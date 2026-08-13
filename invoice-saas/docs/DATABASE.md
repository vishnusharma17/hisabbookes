# Database

PostgreSQL is the source of truth for relational business data.

## Initial entities

- users
- businesses
- customers
- invoices
- invoice_items
- subscriptions
- payments
- audit_events

## Ownership

Business-owned resources must be reachable only through an authenticated user's authorized business.

## Migration rule

Every schema change must use a migration. Never manually mutate production schema or delete an applied migration.

## Financial record rule

Finalized invoices are retained historical records. Corrections/cancellations require a defined workflow rather than destructive overwrite.
