# BillFlow Project Agent Rules

## Project

BillFlow is an India-first invoice SaaS for freelancers, consultants, agencies, and small service businesses.

## Source of truth

Before making changes, read:
1. AGENTS.md
2. docs/PRODUCT.md
3. docs/ARCHITECTURE.md
4. docs/SECURITY.md
5. docs/LEGAL_COMPLIANCE.md
6. the relevant task file

## Rules

- Do not change product requirements without approval.
- Do not invent legal/tax rules.
- Do not claim GST compliance without professional review.
- Do not expose secrets.
- Do not store card information.
- Do not modify finalized invoices silently.
- Do not bypass authorization checks.
- Do not introduce dependencies without justification.
- Run relevant tests after changes.
- Update documentation when architecture changes.
- Keep changes small and focused.
- Do not rewrite unrelated files.
- Do not delete existing functionality unless explicitly requested.
- Every financial calculation needs tests.
- Every database change requires a migration.
- Every payment state change must be verified server-side.
- Prefer small, reversible changes.

## Before coding

1. Inspect existing implementation.
2. Identify affected files.
3. Read relevant documentation.
4. State the implementation plan.
5. Implement the smallest safe change.

## After coding

1. Run tests.
2. Run lint/type checks.
3. Verify affected flows.
4. Check security implications.
5. Update documentation if needed.
6. Summarize changed files and verification.

## High-risk approval gates

Human/qualified-professional approval is required before:
- GST/tax rule implementation is treated as compliant.
- Payment production launch.
- Legal documents are finalized.
- Production launch.
- Major database migrations.
- Changes to finalized invoice retention/cancellation behavior.
