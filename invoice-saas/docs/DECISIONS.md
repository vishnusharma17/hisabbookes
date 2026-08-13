# Architecture Decisions

## ADR-001 — India-first launch

**Decision:** Launch with India as the initial market.

**Reason:** Reduce localization, tax, and payment complexity while validating the core invoice workflow.

## ADR-002 — PostgreSQL

**Decision:** Use PostgreSQL for relational business and invoice data.

**Reason:** Strong transactional consistency and relational modeling fit invoices, customers, businesses, subscriptions and payments.

## ADR-003 — Invoice-first MVP

**Decision:** Build invoice creation and PDF generation before advanced dashboard/reporting features.

**Reason:** A completed invoice is the primary proof of product value.
