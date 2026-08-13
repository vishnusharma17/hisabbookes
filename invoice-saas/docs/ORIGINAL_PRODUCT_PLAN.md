# Invoice SaaS — Complete Product, Technical, Business & Legal Launch Plan

> **Working product name:** BillFlow  
> **Positioning:** Create professional invoices. Get paid faster.  
> **Initial market:** India  
> **Primary users:** Freelancers, consultants, agencies, designers, developers, digital marketers and small service businesses.

---

## 1. Executive Summary

The product is an India-first SaaS for creating, managing, downloading and sharing professional business invoices.

The first version should **not** try to become a full accounting or ERP platform. The objective is to solve one repeated problem extremely well:

> Business owner → enters customer/service details → generates invoice → downloads/shares it.

The MVP should be deliberately small, fast and reliable.

### Initial success criteria

Do not optimize for revenue first.

The first validation target is:

- 100 real businesses using the product
- 20+ returning users
- 5–10 paying customers
- Users successfully creating and downloading invoices without support
- No critical security, payment or data-loss issues
- Positive evidence that users need the product repeatedly

---

# 2. Product Vision

## Short-term

Build the simplest reliable invoice-generation SaaS for Indian small businesses.

## Medium-term

Expand into:

- Customer management
- Payment tracking
- Payment reminders
- Recurring invoices
- Business reports
- Better GST workflows
- Integrations

## Long-term

Become a lightweight business billing/finance platform for SMBs.

```text
Invoice
   ↓
Customer
   ↓
Payment Tracking
   ↓
Payment Reminder
   ↓
Recurring Invoice
   ↓
Reports
   ↓
Integrations
```

---

# 3. Target Audience

## Primary audience

### 1. Freelancers

Examples:

- Developers
- Designers
- Writers
- Video editors
- Consultants

### 2. Agencies

Examples:

- Web agencies
- Marketing agencies
- Design agencies
- Software agencies

### 3. Consultants

Examples:

- Business consultants
- Financial consultants
- Marketing consultants
- Technical consultants

### 4. Small service businesses

Examples:

- Repair/service providers
- Local professionals
- Independent contractors

---

# 4. Problem Statement

Many small businesses do not need a complicated accounting ERP.

Their immediate requirement is:

```text
Create professional invoice
        ↓
Apply relevant tax information
        ↓
Generate PDF
        ↓
Send to customer
        ↓
Track whether it is paid
```

The product should reduce this workflow to a few minutes.

---

# 5. Core Product Flow

```text
Landing Page
     ↓
Create Free Invoice
     ↓
Business Details
     ↓
Customer Details
     ↓
Items / Services
     ↓
Tax / GST
     ↓
Preview
     ↓
Finalize
     ↓
Generate PDF
     ↓
Download / Share
```

Later:

```text
Invoice
   ↓
Payment Status
   ↓
Paid / Pending / Overdue
   ↓
Reminder
```

---

# 6. MVP Scope

## P0 — Must Have

- User registration/login
- Business profile
- Customer creation
- Invoice creation
- Invoice number
- Invoice date
- Due date
- Line items
- Quantity
- Rate
- Discount
- Tax fields
- CGST/SGST/IGST support where applicable
- Invoice preview
- PDF generation
- PDF download
- Invoice history
- Draft invoices
- Finalized invoices
- Basic invoice statuses
- Responsive UI

## P1 — Important but can follow MVP

- Business logo
- Multiple invoice templates
- Payment status
- Shareable invoice
- Email invoice
- Customer history
- Search/filter
- Custom notes
- Duplicate invoice

## P2 — Later

- Recurring invoices
- Payment reminders
- Multiple businesses
- Multiple users
- Reports
- Advanced analytics
- Integrations
- WhatsApp sharing
- Accounting integrations
- International currencies
- International tax support

---

# 7. Features Explicitly Out of MVP

Do not build these initially:

- Full accounting system
- Payroll
- Inventory
- Bank reconciliation
- GST return filing
- E-way bill
- Full e-invoicing integration
- AI accountant
- Mobile native apps
- Multi-country tax engine
- Payment processing infrastructure
- Marketplace
- Complex expense management

The goal is to launch quickly and validate demand.

---

# 8. Invoice Data Model

A business profile should support:

- Legal name
- Display name
- Address
- State
- Country
- GSTIN where applicable
- Contact email
- Phone
- Logo
- Invoice numbering preferences

Customer profile:

- Name
- Company name where applicable
- Address
- State
- Country
- GSTIN where applicable
- Email
- Phone

Invoice:

- Invoice number
- Invoice date
- Due date
- Business
- Customer
- Currency
- Items
- HSN/SAC where applicable
- Quantity
- Rate
- Discount
- Tax rate
- Tax amount
- Subtotal
- Taxable amount
- CGST
- SGST
- IGST
- Total
- Notes
- Terms
- Payment status
- PDF reference
- Created timestamp
- Updated timestamp

---

# 9. GST & Tax Compliance Approach

## Important

This product is software, not a tax advisory service.

The user remains responsible for:

- Correct business information
- Correct customer information
- Correct GSTIN
- Correct HSN/SAC
- Correct tax treatment
- Correct place-of-supply information
- Correct tax filing
- Correct accounting

The product should assist with calculation and formatting, not pretend to determine every tax treatment automatically.

## Official reference

CBIC GST invoice rules describe required particulars for applicable tax invoices, including supplier information, invoice number/date, recipient information where applicable, HSN/SAC, description, taxable value, tax rate/amount, place of supply for relevant inter-State supplies, reverse-charge indication where applicable, and other requirements.

Official source:

https://cbic-gst.gov.in/gst-invoice-rules.html

## Architecture rule

Do not hard-code tax assumptions everywhere in the UI.

Instead:

```text
Tax Configuration
       ↓
Tax Calculation Engine
       ↓
Invoice
```

Keep tax rules isolated and versionable so that future rule changes can be implemented without rewriting the entire product.

## CA review

Before production launch, have an Indian CA review:

- GST fields
- GST calculation flow
- Invoice numbering
- Tax labels
- Cancellation behavior
- Credit/debit note requirements
- Record retention
- BillFlow's own SaaS tax treatment

---

# 10. Invoice Numbering

Invoice numbering must be treated as a financial record, not as an ordinary UI field.

Example:

```text
INV-2026-00001
INV-2026-00002
INV-2026-00003
```

Requirements:

- Unique invoice numbers
- Consecutive numbering where applicable
- Financial-year-aware configuration
- No accidental reuse
- Strong protection after finalization
- Audit trail

Recommended states:

```text
DRAFT
   ↓
FINALIZED
   ↓
PAID / PENDING / OVERDUE
```

If a finalized document needs correction, do not simply overwrite the historical record. Define a compliant correction/cancellation workflow with CA review.

---

# 11. Delete & Retention Strategy

Do not blindly allow permanent deletion of finalized financial records.

Recommended approach:

### Draft

Can be edited/deleted.

### Finalized

Restrict edits.

### Cancelled

Retain historical record with cancellation metadata.

### Paid

Keep historical record.

Use an audit trail:

```text
Created
Updated
Finalized
Downloaded
Shared
Marked Paid
Cancelled
```

Define the exact retention period with professional tax/legal advice.

---

# 12. Pricing Model

## Free

₹0

- 5 invoices/month
- 1 business
- 1 template
- PDF download
- Basic history

## Pro

₹249/month

- Unlimited invoices
- Premium templates
- Logo/branding
- Invoice history
- Payment status
- Customer history
- Shareable invoices
- Remove product branding

## Business

₹599/month

- Multiple businesses
- Multiple users
- Recurring invoices
- Payment reminders
- Advanced reports
- Priority support

## Annual plans

Pro:

₹2,490/year

Business:

₹5,990/year

Pricing is a proposed starting point and should be validated with real users.

---

# 13. Revenue Model

Illustrative scenario only.

Assumption:

- 2% paid conversion
- ₹300 average monthly revenue per paying customer

| Monthly active users | Paying users | Illustrative monthly revenue |
|---:|---:|---:|
| 10,000 | 200 | ₹60,000 |
| 25,000 | 500 | ₹1,50,000 |
| 50,000 | 1,000 | ₹3,00,000 |
| 100,000 | 2,000 | ₹6,00,000 |

These are planning scenarios, not forecasts.

Actual conversion will depend on:

- Traffic quality
- Product quality
- Pricing
- Retention
- Competition
- SEO
- Distribution
- User segment

---

# 14. Product Funnel

Track the full funnel:

```text
Visitors
   ↓
Signups
   ↓
Business Created
   ↓
First Invoice Started
   ↓
First Invoice Created
   ↓
PDF Downloaded
   ↓
Returning User
   ↓
Paid User
```

Illustrative example:

| Stage | Example users |
|---|---:|
| Visitors | 10,000 |
| Signups | 1,000 |
| First invoice | 500 |
| PDF download | 350 |
| Returning users | 150 |
| Paid users | 20 |

These numbers are placeholders for planning and must be replaced by actual analytics after launch.

---

# 15. North Star Metric

Initial North Star Metric:

> **Invoices successfully created and downloaded per week.**

Why?

A signup does not prove product value.

A completed invoice does.

A returning user creating another invoice is an even stronger signal.

---

# 16. Business Model

Primary revenue:

- Monthly subscriptions

Secondary:

- Annual subscriptions
- Business/team plans

Later:

- Add-ons
- Integrations
- Premium templates
- Automation features

Illustrative mature revenue mix:

- Subscriptions: 60%
- Annual plans: 20%
- Business/team plans: 15%
- Add-ons: 5%

This is a planning model, not a forecast.

---

# 17. Technical Architecture

## Recommended stack

### Frontend

Next.js

Reason:

- SEO
- Server rendering options
- Good React ecosystem
- Easy marketing/product separation

### Backend

Node.js + Express

### Database

PostgreSQL

Reason:

Invoice/customer/business relationships are relational and benefit from strong transactional consistency.

### Storage

S3-compatible object storage.

Use for:

- Logos
- Invoice PDFs
- Future attachments

### Authentication

Start with:

- Email/password

Later:

- Google login
- Other OAuth providers

### Email

Use a transactional email provider.

### Payments

Use an established payment gateway/aggregator.

Do not build a payment processor.

---

# 18. High-Level Architecture

```text
                 ┌─────────────────┐
                 │    Next.js UI   │
                 └────────┬────────┘
                          │
                          ▼
                 ┌─────────────────┐
                 │    API Layer    │
                 │ Node + Express  │
                 └────────┬────────┘
                          │
              ┌───────────┼───────────┐
              ▼           ▼           ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │PostgreSQL│ │  Storage │ │  Email   │
        └──────────┘ └──────────┘ └──────────┘
                          │
                          ▼
                  ┌───────────────┐
                  │Payment Gateway│
                  └───────────────┘
```

---

# 19. Database Structure

```text
users
 ├── id
 ├── email
 ├── password_hash
 ├── status
 └── created_at

businesses
 ├── id
 ├── user_id
 ├── legal_name
 ├── display_name
 ├── address
 ├── state
 ├── gstin
 ├── logo_url
 └── created_at

customers
 ├── id
 ├── business_id
 ├── name
 ├── email
 ├── phone
 ├── address
 ├── state
 └── gstin

invoices
 ├── id
 ├── business_id
 ├── customer_id
 ├── invoice_number
 ├── invoice_date
 ├── due_date
 ├── status
 ├── subtotal
 ├── discount
 ├── taxable_amount
 ├── cgst
 ├── sgst
 ├── igst
 ├── total
 ├── pdf_url
 └── created_at

invoice_items
 ├── id
 ├── invoice_id
 ├── description
 ├── hsn_sac
 ├── quantity
 ├── rate
 ├── tax_rate
 └── amount

subscriptions
 ├── id
 ├── user_id
 ├── plan
 ├── status
 ├── gateway_customer_id
 └── gateway_subscription_id

payments
 ├── id
 ├── user_id
 ├── gateway_payment_id
 ├── amount
 ├── currency
 ├── status
 └── created_at
```

---

# 20. Security Requirements

## Authentication

Never store plaintext passwords.

Use a strong password hashing algorithm such as Argon2id or bcrypt.

## API

Implement:

- HTTPS
- Authentication/authorization
- Input validation
- Rate limiting
- Secure sessions/tokens
- CORS policy
- Security headers
- CSRF protections where applicable

## Secrets

Never commit:

- Database passwords
- API keys
- Payment secrets
- JWT secrets
- Storage credentials

Use environment variables/secrets management.

## Files

Invoice PDFs should not be publicly exposed by predictable URLs.

Recommended:

```text
Private storage
      ↓
Authenticated request
      ↓
Short-lived signed URL
```

## Database

- Encrypted backups
- Least-privilege access
- Production credentials separate from development
- Monitoring
- Restore testing

---

# 21. Payment Architecture

Do not store card information.

Use:

```text
User
  ↓
BillFlow
  ↓
Payment Gateway
  ↓
Bank
```

Payment gateway handles payment credentials.

BillFlow stores only the identifiers and payment state needed for the subscription.

Important payment events:

```text
Checkout started
Payment successful
Payment failed
Subscription active
Subscription cancelled
Subscription renewed
Refund initiated
Refund completed
```

All gateway webhooks must be verified.

Do not trust a client-side "payment successful" flag.

---

# 22. Subscription Logic

Example:

```text
FREE
 ↓
Upgrade
 ↓
Checkout
 ↓
Payment
 ↓
Webhook verification
 ↓
PRO ACTIVE
```

If payment fails:

```text
PRO ACTIVE
 ↓
Payment failed
 ↓
Grace period / gateway-defined retry
 ↓
Still failed
 ↓
Restricted account
```

Exact billing behavior should match the payment provider's subscription capabilities and terms.

---

# 23. Privacy & Data Protection

The application may process:

- Names
- Addresses
- Email addresses
- Phone numbers
- GSTIN
- Business information
- Customer information
- Invoice information

India's Digital Personal Data Protection Rules, 2025 were notified by MeitY in November 2025, with provisions coming into force according to the published commencement schedule.

Official source:

https://www.meity.gov.in/documents/act-and-policies/digital-personal-data-protection-rules-2025-gDOxUjMtQWa

Before production launch:

- Prepare Privacy Policy
- Identify personal data collected
- Document purposes
- Define retention/deletion
- Provide account deletion mechanism
- Provide appropriate user rights/mechanisms
- Review vendor/subprocessor arrangements
- Review consent requirements
- Review security safeguards

Have privacy/legal counsel review the final implementation.

---

# 24. Legal Pages

Minimum production pages:

```text
/terms
/privacy
/refund-policy
/contact
```

Potentially:

```text
/cookies
/security
/data-processing
```

depending on the final business model and legal review.

Do not copy another company's Terms or Privacy Policy.

Use a lawyer or reputable legal drafting service and customize documents for the actual product.

---

# 25. Consumer Protection

The product should clearly disclose:

- Pricing
- Taxes where applicable
- Billing frequency
- Auto-renewal behavior
- Cancellation process
- Refund policy
- Support contact
- Product limitations

Avoid:

- Hidden charges
- Fake urgency
- Misleading countdowns
- Forced subscriptions
- Difficult cancellation
- Preselected paid upgrades
- Fake testimonials

Indian consumer authorities maintain guidance/materials concerning e-commerce and dark patterns.

Official source:

https://consumeraffairs.nic.in/acts-and-rules/consumer-protection/consumer-protection

---

# 26. BillFlow's Own Tax/Business Compliance

Do not confuse:

1. GST/tax treatment of invoices generated by customers
2. GST/tax treatment of BillFlow's SaaS subscription revenue

They are separate.

Before charging customers, consult a CA regarding:

- Business structure
- SaaS classification
- GST registration
- GST on subscription
- Indian customers
- Foreign customers
- Export of services
- Accounting
- Tax invoices
- Subscription revenue recognition

---

# 27. Business Structure

Potential options:

### Sole proprietorship

Suitable for some solo validation situations.

### LLP

Useful for certain multi-founder structures.

### Private Limited Company

Potentially preferable for:

- Larger SaaS operation
- Multiple founders
- Investment
- Employees
- Equity distribution
- Scaling

Do not choose purely based on internet advice.

Ask a CA/CS/lawyer to recommend the appropriate structure for the actual founders and plans.

---

# 28. Brand & Trademark

Before finalizing the product name:

```text
Product name
   ↓
Google search
   ↓
Domain availability
   ↓
Trademark search
   ↓
Social handle search
   ↓
Professional legal verification
```

"BillFlow" is only a working name in this plan.

Do not assume it is legally available.

---

# 29. Landing Page

## Hero

Headline:

> Create professional invoices in seconds.

Supporting copy:

> Create, customize and download invoices for your business without complicated accounting software.

Primary CTA:

> Create Free Invoice

Secondary CTA:

> See how it works

## Sections

1. Hero
2. Product preview
3. How it works
4. Built for
5. Features
6. Templates
7. Pricing
8. FAQ
9. Footer

---

# 30. SEO Strategy

Initial landing/product pages:

```text
/invoice-generator
/gst-invoice-generator
/invoice-maker
/free-invoice-generator
/freelance-invoice
/consultant-invoice
/agency-invoice
/invoice-template
```

Each page must provide unique value.

Do not generate hundreds of nearly identical SEO pages.

## Content topics

- How to create a GST invoice
- What should a GST invoice contain?
- Invoice vs bill
- How invoice numbering works
- How freelancers can invoice clients
- How agencies can invoice clients
- How to create an invoice for services

Tax/legal content should be reviewed by a qualified professional before publishing.

---

# 31. Analytics

Track product events from day one.

Recommended events:

```text
landing_view
signup
business_created
customer_created
invoice_started
invoice_created
invoice_finalized
pdf_downloaded
invoice_shared
pricing_viewed
checkout_started
payment_success
payment_failed
subscription_cancelled
```

Avoid collecting unnecessary personal data.

---

# 32. Dashboard Metrics

## Daily

- Visitors
- Signups
- Businesses created
- Invoices created
- PDFs downloaded
- Returning users
- Paid users
- Revenue
- Failed payments
- Cancellations

## Weekly

- Activation rate
- Invoice creation rate
- Return rate
- Paid conversion
- MRR
- Churn
- ARPU

---

# 33. Product Activation Definition

A user is "activated" when they:

```text
Signup
 ↓
Create business
 ↓
Create invoice
 ↓
Download/share invoice
```

This is much more useful than simply measuring registrations.

---

# 34. 30-Day Development Plan

## Week 1 — Foundation

### Day 1

- Create repository
- Define architecture
- Setup environment
- Setup CI/CD
- Create coding standards

### Day 2

- PostgreSQL
- Database migrations
- Auth foundation

### Day 3

- User dashboard
- Business profile

### Day 4

- Customer CRUD

### Day 5

- Invoice form

### Day 6

- Calculation engine

### Day 7

- Invoice preview

---

# 35. Week 2 — Product MVP

Build:

- PDF generation
- Invoice templates
- Invoice history
- Search
- Filters
- Draft mode
- Finalization
- Logo upload
- Responsive UI
- Error states
- Empty states

---

# 36. Week 3 — SaaS Layer

Build:

- Pricing page
- Free plan limits
- Pro plan
- Checkout
- Payment gateway
- Webhooks
- Subscription status
- Email
- Analytics
- Account settings

---

# 37. Week 4 — Compliance & Launch

Complete:

- Security review
- GST logic review
- Invoice format review
- Privacy Policy
- Terms
- Refund Policy
- Data deletion
- Account deletion
- Backups
- Monitoring
- Error tracking
- SEO
- Production testing

Do not publicly launch until critical legal/security issues are reviewed.

---

# 38. Development Milestones

## Milestone 1

A user can create an invoice.

## Milestone 2

A user can download a professional PDF.

## Milestone 3

A user can return and find the invoice.

## Milestone 4

A user can track payment status.

## Milestone 5

A user can pay for Pro.

## Milestone 6

A real paying customer successfully uses the product.

## Milestone 7

Multiple paying customers use it repeatedly.

---

# 39. Testing Strategy

## Unit tests

Test:

- Tax calculations
- Discount calculations
- Totals
- Invoice numbering
- Subscription limits

## Integration tests

Test:

- Signup
- Invoice creation
- PDF generation
- Payment webhook
- Subscription activation
- Cancellation

## E2E tests

Test:

```text
Signup
 ↓
Business
 ↓
Customer
 ↓
Invoice
 ↓
Preview
 ↓
Finalize
 ↓
PDF
```

## Security tests

Test:

- Authentication bypass
- IDOR
- Unauthorized invoice access
- File access
- Rate limiting
- Input injection
- Webhook spoofing
- Session issues

---

# 40. Important Authorization Rule

Never rely only on frontend IDs.

Bad:

```text
GET /invoice/123
```

and return invoice 123 because the user is logged in.

Correct:

```text
GET /invoice/123

Check:
invoice.business_id
        ↓
belongs to authenticated user?
        ↓
YES → return
NO  → deny
```

This is critical because invoice data is private business/customer data.

---

# 41. PDF Security

Do not include sensitive information unnecessarily.

PDF should contain only required business/customer information.

Avoid:

- Internal database IDs
- API keys
- Internal URLs
- Debug information
- Hidden metadata containing secrets

---

# 42. Email Security

Invoice email should not expose unrelated customer data.

Use:

- Verified sending domain
- SPF
- DKIM
- DMARC
- Secure invoice links
- Expiring links where appropriate

Do not place confidential information into email subject lines.

---

# 43. Backup Strategy

At minimum:

```text
Production DB
     ↓
Automated backup
     ↓
Separate storage
     ↓
Periodic restore test
```

A backup that has never been restored/tested should not be treated as reliable.

---

# 44. Monitoring

Use monitoring for:

- API errors
- Failed PDF generation
- Database errors
- Payment failures
- Webhook failures
- Email failures
- High latency
- Storage failures

Critical alerts:

```text
Payment webhook failure
Database unavailable
PDF generation failure spike
Authentication failure spike
Storage unavailable
```

---

# 45. Support

Initial support:

- Email
- Contact form

Later:

- In-app support
- Help center
- FAQ
- Chat

Create standard support categories:

```text
Billing
Invoice
GST
Account
Payment
Refund
Technical issue
Data deletion
```

Tax questions should not be answered as professional tax advice unless handled by qualified professionals.

---

# 46. AI Roadmap

Do not put AI into the MVP.

Later:

### AI invoice drafting

User:

> Website development 50k, hosting 5k, maintenance 10k.

AI converts it into draft line items.

User must review and confirm.

AI should not silently determine:

- GST applicability
- HSN/SAC
- Legal tax treatment
- Place of supply

The system should clearly separate AI assistance from tax decisions.

---

# 47. Long-Term Roadmap

```text
MVP
 ↓
Invoice History
 ↓
Customer Management
 ↓
Payment Tracking
 ↓
Payment Reminders
 ↓
Recurring Invoices
 ↓
Reports
 ↓
Integrations
 ↓
Advanced GST Features
 ↓
Internationalization
```

---

# 48. 12-Month Roadmap

## Month 1

Invoice MVP

## Month 2

Paid plans

## Month 3

Customer management

## Month 4

Payment tracking

## Month 5

Recurring invoices

## Month 6

GST improvements

## Month 7

Email/WhatsApp sharing

## Month 8

Reports

## Month 9

Integrations

## Month 10

PWA/mobile optimization

## Month 11

Internationalization research

## Month 12

Business billing platform expansion

---

# 49. What NOT to Do

Do not:

- Copy competitors' UI
- Copy legal documents
- Claim guaranteed GST compliance
- Store card data
- Store passwords in plaintext
- Put secrets in Git
- Make finalized invoices freely editable
- Delete financial records without a defined policy
- Launch without privacy/terms/refund pages
- Hard-code tax logic everywhere
- Build 30 features before getting users
- Add AI just for marketing
- Target every country at launch
- Make unsupported legal/tax claims

---

# 50. Launch Checklist

## Business

- [ ] Business structure decided
- [ ] PAN/business banking setup
- [ ] GST position reviewed
- [ ] SaaS tax treatment reviewed
- [ ] Subscription billing reviewed

## Product

- [ ] Invoice creation works
- [ ] PDF works
- [ ] Invoice numbering reviewed
- [ ] GST fields reviewed
- [ ] Draft/finalized behavior defined
- [ ] Cancellation behavior defined
- [ ] Audit trail implemented

## Privacy

- [ ] Privacy Policy
- [ ] Data inventory
- [ ] Retention policy
- [ ] Deletion flow
- [ ] Account deletion
- [ ] Vendor/subprocessor review

## Payments

- [ ] Payment gateway onboarding
- [ ] KYC
- [ ] Subscription setup
- [ ] Webhook verification
- [ ] Failed payment handling
- [ ] Refund flow
- [ ] Cancellation flow

## Security

- [ ] HTTPS
- [ ] Password hashing
- [ ] Rate limiting
- [ ] Authorization
- [ ] Secure storage
- [ ] Database backup
- [ ] Restore test
- [ ] Dependency audit
- [ ] Error monitoring

## Consumer protection

- [ ] Terms
- [ ] Pricing transparency
- [ ] Refund policy
- [ ] Cancellation process
- [ ] Auto-renewal disclosure
- [ ] Support contact
- [ ] No deceptive UI

## Launch

- [ ] Production domain
- [ ] SEO metadata
- [ ] Analytics
- [ ] Sitemap
- [ ] Robots.txt
- [ ] Error pages
- [ ] Monitoring
- [ ] Support email
- [ ] Final legal review

---

# 51. Recommended First Version

The actual first release should contain only:

```text
Landing
   ↓
Signup
   ↓
Business Profile
   ↓
Customer
   ↓
Create Invoice
   ↓
GST/Tax Fields
   ↓
Preview
   ↓
Finalize
   ↓
PDF
   ↓
Invoice History
```

Then:

```text
Free
   ↓
Pro
   ↓
Payment
```

Everything else comes after validation.

---

# 52. Final Strategic Recommendation

The goal is not:

> "Build the biggest invoice software."

The goal is:

> **Build the easiest reliable way for a small Indian business to create and send a professional invoice.**

Start narrow.

Validate.

Then expand.

The safest growth path is:

```text
Simple Invoice Generator
        ↓
Invoice Manager
        ↓
Payment Tracker
        ↓
Recurring Billing
        ↓
SMB Billing Platform
```

---

# 53. Legal Disclaimer for Internal Planning

This document is a product/business/technical planning document and is **not legal, tax, accounting or regulatory advice**.

Before public launch, obtain professional review from appropriately qualified Indian professionals for:

- GST
- Business/entity structure
- SaaS taxation
- Consumer protection
- Privacy/data protection
- Contracts
- Payment compliance
- Intellectual property/trademark
- Record retention

Official sources should be preferred over blogs when implementing regulatory requirements.

Primary references:

- CBIC GST invoice rules: https://cbic-gst.gov.in/gst-invoice-rules.html
- CBIC GST FAQs: https://cbic-gst.gov.in/hindi/sectoral-faq.html
- MeitY DPDP Rules 2025: https://www.meity.gov.in/documents/act-and-policies/digital-personal-data-protection-rules-2025-gDOxUjMtQWa
- RBI payment-system materials: https://www.rbi.org.in/
- Department of Consumer Affairs: https://consumeraffairs.nic.in/

---

# 54. The First 10 Things To Do

If starting today, execute in this exact order:

1. Choose/finalize a legally available brand name.
2. Verify domain and trademark availability.
3. Interview 10–20 target users.
4. Confirm their invoice workflow and pain points.
5. Get CA review of the proposed India/GST invoice model.
6. Freeze MVP requirements.
7. Create technical architecture and database schema.
8. Build invoice creation + PDF first.
9. Test with real businesses before adding advanced features.
10. Add payments only after users demonstrate repeat usage.

**Do not start by building the dashboard. Start by building the invoice.**


---

# 55. AI-FIRST DEVELOPMENT MODEL

> **This product is intended to be built primarily with AI coding agents.**
>
> The project must therefore be structured so that Claude Code, Codex, Cursor, Antigravity, GitHub Copilot/agentic tools, or another capable coding agent can understand the same project without requiring the original agent's memory.

The key principle is:

> **The repository is the source of truth, not the AI conversation.**

Every important product, architecture, coding, legal-review, testing and deployment decision must be represented in project files.

---

# 56. AI AGENT OPERATING PRINCIPLE

Do not tell an AI agent:

> "Build an invoice SaaS."

That is too broad.

Instead give the agent:

```text
Project context
        ↓
Product requirements
        ↓
Architecture rules
        ↓
Coding rules
        ↓
Current task
        ↓
Acceptance criteria
        ↓
Tests
        ↓
Verification
```

Every agent should work from the same files.

---

# 57. COMMON AI-FRIENDLY PROJECT STRUCTURE

Recommended repository:

```text
invoice-saas/
│
├── apps/
│   ├── web/
│   └── api/
│
├── packages/
│   ├── ui/
│   ├── types/
│   ├── validation/
│   └── invoice-engine/
│
├── docs/
│   ├── PRODUCT.md
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   ├── SECURITY.md
│   ├── LEGAL_COMPLIANCE.md
│   ├── AI_RULES.md
│   ├── UX_RULES.md
│   ├── API.md
│   ├── TESTING.md
│   └── DECISIONS.md
│
├── tasks/
│   ├── TODO.md
│   ├── IN_PROGRESS.md
│   └── DONE.md
│
├── .github/
│   └── workflows/
│
├── tests/
│
├── .env.example
├── AGENTS.md
├── CLAUDE.md
├── README.md
├── package.json
└── ...
```

The exact framework can change, but the **information architecture should remain stable**.

---

# 58. THE MOST IMPORTANT FILE — AGENTS.md

Create a root-level `AGENTS.md`.

This is the common instruction file for coding agents.

It should contain:

```text
# Project Agent Rules

## Project

This is an India-first invoice SaaS.

## Source of truth

Before making changes, read:

1. AGENTS.md
2. docs/PRODUCT.md
3. docs/ARCHITECTURE.md
4. docs/SECURITY.md
5. docs/LEGAL_COMPLIANCE.md
6. relevant task file

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
```

This file should be treated as the **common baseline across agents**.

---

# 59. CLAUDE.md / AGENT-SPECIFIC FILES

If an agent supports its own instruction file, keep it thin.

Example:

```text
CLAUDE.md
```

should mainly say:

```text
Read and follow AGENTS.md.

AGENTS.md is the project's canonical agent instruction source.

Do not duplicate product requirements here.
```

Similarly, if another agent requires a separate file, keep the project rules synchronized rather than maintaining completely different instructions.

The goal is:

```text
AGENTS.md
      ↓
Common project truth
      ↓
Claude / Codex / Cursor / Antigravity
```

---

# 60. PRODUCT.md

`docs/PRODUCT.md` should contain the actual product specification.

It should define:

- Target audience
- Problem
- Product promise
- MVP
- P0/P1/P2 features
- User journeys
- Pricing
- Business rules
- Out-of-scope features
- Success metrics
- Future roadmap

Example:

```text
# Product

## Goal

Create professional invoices quickly.

## Primary user

Indian freelancers and small service businesses.

## MVP

Create → Preview → Finalize → PDF → History.

## Out of scope

Accounting
Payroll
Inventory
GST return filing
E-way bills
International tax engine
```

Agents should not invent new product scope.

---

# 61. ARCHITECTURE.md

This file describes how the system is built.

Include:

```text
Frontend
Backend
Database
Storage
Authentication
Payments
Email
Deployment
Observability
```

Also include architectural rules.

Example:

```text
Invoice calculation logic must live in the invoice-engine package.

The frontend must never independently calculate authoritative totals.

The backend is the source of truth for invoice totals.

Payment state is updated from verified gateway webhooks.

Users can access only resources belonging to their authorized business.
```

This prevents agents from implementing the same logic differently in multiple places.

---

# 62. DATABASE.md

Define:

- Tables
- Relationships
- Constraints
- Indexes
- Status enums
- Ownership rules
- Migration rules

Important:

```text
Never manually edit production database schema.

Every schema change must use a migration.

Never delete a migration that has already been applied.
```

---

# 63. SECURITY.md

This should be treated as a hard constraint.

Include:

### Authentication

- Password hashing
- Session/token handling
- Account recovery

### Authorization

Every resource access must verify ownership.

### Files

Private storage + signed URLs.

### Payments

No card storage.

### Secrets

No secrets in source control.

### API

Validation + rate limiting.

### Logging

Never log:

- Passwords
- Payment secrets
- Authentication tokens
- Sensitive customer data unnecessarily

---

# 64. LEGAL_COMPLIANCE.md

This file should NOT contain invented legal rules.

Instead maintain:

```text
Requirement
Source
Current interpretation
Implementation
Professional review required?
Review status
Last reviewed
```

Example:

| Area | Requirement | Source | Status |
|---|---|---|---|
| GST | Invoice fields | CBIC | CA review |
| Privacy | Personal data handling | MeitY | Legal review |
| Payments | Gateway requirements | RBI/provider | Provider review |
| Consumer | Refund/cancellation | Consumer Affairs | Legal review |

This is much safer for AI development than telling an agent:

> "Make it legally compliant."

---

# 65. DECISIONS.md

Maintain an Architecture Decision Record style log.

Example:

```text
# Decision: PostgreSQL

Date:
Reason:
Alternatives:
Decision:
Impact:
```

Another:

```text
# Decision: India-first launch

Reason:
Reduce tax complexity.
Reduce payment complexity.
Reduce localization scope.
```

Agents should read this before proposing changes that contradict existing decisions.

---

# 66. TASK SYSTEM FOR AI AGENTS

Never give an agent a huge vague task.

Bad:

```text
Build the entire dashboard.
```

Good:

```text
TASK-014

Title:
Create invoice item editor.

Goal:
Allow users to add/edit/remove invoice line items.

Files:
Relevant invoice editor files.

Requirements:
- Description
- HSN/SAC
- Quantity
- Rate
- Discount
- Tax rate

Acceptance criteria:
- User can add item.
- User can edit item.
- User can remove item.
- Validation works.
- Totals update correctly.
- Existing tests remain passing.

Do not:
- Change invoice PDF layout.
- Change database schema.
- Add new dependencies.
```

---

# 67. AI TASK LIFECYCLE

Every task should move through:

```text
BACKLOG
   ↓
READY
   ↓
IN_PROGRESS
   ↓
REVIEW
   ↓
VERIFIED
   ↓
DONE
```

The agent should never silently mark something complete.

---

# 68. AI CODING LOOP

For every task:

```text
1. Read project rules
2. Read task
3. Inspect code
4. Identify dependencies
5. Plan
6. Implement
7. Test
8. Review diff
9. Fix issues
10. Update docs
11. Report result
```

This is the default workflow.

---

# 69. ONE AGENT = ONE CLEAR JOB

Avoid giving multiple agents overlapping ownership.

Example:

### Agent A

Frontend invoice UI

### Agent B

Backend invoice API

### Agent C

Invoice calculation engine

### Agent D

Tests

### Human

Product/legal decisions

If working sequentially, the same agent can do multiple jobs, but the task boundary should remain clear.

---

# 70. MULTI-AGENT HANDOFF

The next agent must not depend on chat history.

Use:

```text
docs/
tasks/
DECISIONS.md
git history
```

Handoff should say:

```text
Completed:
- Invoice form
- Validation

Remaining:
- PDF rendering

Known issues:
- Mobile table needs testing

Tests:
- npm test
- npm run lint

Do not change:
- Invoice calculation package
```

---

# 71. AI + LEGAL SAFETY GATE

This is critical.

AI may implement code.

AI should NOT independently decide:

- GST legal interpretation
- Tax applicability
- Whether a transaction is legally compliant
- Legal contract terms
- Privacy obligations
- Regulatory interpretation

Workflow:

```text
AI research/draft
      ↓
Official source verification
      ↓
Human/CA/lawyer review
      ↓
Approved rule
      ↓
Documented in LEGAL_COMPLIANCE.md
      ↓
AI implementation
      ↓
Tests
```

This prevents the AI from turning an assumption into production law.

---

# 72. AI + GST IMPLEMENTATION

Do not ask:

> "Implement GST compliance."

Instead:

```text
Approved tax requirement
        ↓
Exact business rule
        ↓
Test cases
        ↓
Invoice engine
        ↓
UI
        ↓
PDF
```

Every tax rule should have:

- Source
- Effective date/version where relevant
- Business rule
- Test cases
- Review status

---

# 73. TEST-FIRST FOR FINANCIAL LOGIC

Financial calculations should have tests before or alongside implementation.

Example:

```text
Input:
Quantity = 2
Rate = ₹1,000
Discount = ₹100
Tax = approved test rate

Expected:
Subtotal = ...
Discount = ...
Taxable amount = ...
Tax = ...
Total = ...
```

Tests should cover:

- Zero quantity
- Decimal quantities where supported
- Decimal rates
- Discounts
- Tax
- Rounding
- Large amounts
- Invalid inputs
- State/tax branches approved by the business specification

Never let an AI "eyeball" financial calculations.

---

# 74. PDF REGRESSION TESTING

Every invoice template should be tested.

Test:

- A4
- Long customer name
- Long address
- Many line items
- Large totals
- Tax values
- Logo
- Empty optional fields
- Page breaks
- Mobile preview
- Downloaded PDF

The PDF should be visually checked before launch.

---

# 75. AI CODE REVIEW CHECKLIST

After each meaningful AI change, review:

### Correctness

- Does it solve the requested task?
- Are edge cases handled?

### Security

- Authorization?
- Input validation?
- Secret exposure?
- File access?

### Data

- Migration needed?
- Backward compatibility?

### Product

- Does behavior match PRODUCT.md?

### Legal

- Does this create a tax/privacy/payment assumption?

### Tests

- Existing tests?
- New tests?

### Scope

- Did the agent modify unrelated files?

---

# 76. Git Strategy

Keep commits small.

Example:

```text
feat(invoice): add invoice item editor
feat(invoice): add invoice calculation engine
feat(invoice): add invoice PDF generation
fix(auth): enforce business ownership check
test(invoice): add tax calculation coverage
docs: update invoice architecture
```

Avoid:

```text
update stuff
changes
final
ai changes
```

Good commit history becomes another source of context for future agents.

---

# 77. Branch Strategy

Recommended:

```text
main
  ↑
feature/invoice-editor
feature/pdf-generation
feature/payment-subscription
fix/invoice-authorization
```

Each feature should pass:

```text
lint
typecheck
unit tests
integration tests
build
```

before merge.

---

# 78. CI/CD

Every pull request should run:

```text
Install
 ↓
Lint
 ↓
Typecheck
 ↓
Unit tests
 ↓
Integration tests
 ↓
Build
```

Production deployment should additionally require:

- Environment validation
- Migration safety
- Build success
- Deployment health check

---

# 79. Environment Files

Commit:

```text
.env.example
```

Never commit:

```text
.env
.env.production
```

`.env.example` should contain names only:

```text
DATABASE_URL=
AUTH_SECRET=
STORAGE_BUCKET=
STORAGE_ACCESS_KEY=
STORAGE_SECRET=
PAYMENT_SECRET=
EMAIL_API_KEY=
```

No real values.

---

# 80. AI Prompt Template

Use this as the standard task prompt:

```text
You are working inside an existing invoice SaaS repository.

Before making changes:

1. Read AGENTS.md.
2. Read the relevant documentation.
3. Inspect the current implementation.
4. Do not assume missing requirements.
5. Do not invent legal or tax rules.

Task:
[EXACT TASK]

Requirements:
[REQUIREMENTS]

Acceptance criteria:
[ACCEPTANCE CRITERIA]

Do not change:
[OUT OF SCOPE]

Before finishing:
- Run relevant tests.
- Run lint/typecheck.
- Review the diff.
- Check authorization/security implications.
- Update documentation if architecture changed.

Final response:
1. What changed
2. Files changed
3. Tests run
4. Test results
5. Remaining risks/issues
```

---

# 81. AI Agent Rules for This Product

The agent must follow:

```text
RULE 1
Do not invent requirements.

RULE 2
Do not invent legal rules.

RULE 3
Do not silently change business logic.

RULE 4
Do not rewrite unrelated code.

RULE 5
Do not add dependencies without reason.

RULE 6
Do not expose secrets.

RULE 7
Do not bypass authorization.

RULE 8
Do not silently change finalized financial records.

RULE 9
Do not claim a feature is compliant without documented review.

RULE 10
Every financial calculation needs tests.

RULE 11
Every payment state change must be verified server-side.

RULE 12
Every database change requires a migration.

RULE 13
Every meaningful architecture change updates documentation.

RULE 14
If requirements conflict, stop and ask for clarification.

RULE 15
Prefer small reversible changes.
```

---

# 82. Recommended AI Build Order

Do not ask AI to build everything at once.

Use this sequence:

```text
01 Project foundation
        ↓
02 Database
        ↓
03 Authentication
        ↓
04 Business profile
        ↓
05 Customers
        ↓
06 Invoice engine
        ↓
07 Invoice editor
        ↓
08 Invoice preview
        ↓
09 PDF generation
        ↓
10 Invoice history
        ↓
11 Security hardening
        ↓
12 Analytics
        ↓
13 Pricing
        ↓
14 Payment integration
        ↓
15 Subscription management
        ↓
16 Legal/launch hardening
        ↓
17 Production
```

---

# 83. Human Approval Gates

AI should not be the final authority on high-risk decisions.

Require human approval before:

### Gate 1

Architecture freeze

### Gate 2

Tax/GST implementation

### Gate 3

Payment integration

### Gate 4

Legal documents

### Gate 5

Production launch

### Gate 6

Major database migrations

### Gate 7

Changing invoice finalization/retention behavior

---

# 84. Definition of Done

A feature is NOT done because the AI says:

> "Implemented successfully."

A feature is done only when:

```text
Requirements met
       +
Tests passing
       +
Security checked
       +
UI verified
       +
No unrelated regressions
       +
Documentation updated
       +
Human review completed where required
```

---

# 85. AI Development Cost Strategy

Use AI aggressively for:

- Boilerplate
- CRUD
- Tests
- Refactoring
- Documentation
- UI implementation
- Type definitions
- API scaffolding
- Error handling
- Test generation
- Code review
- Debugging

Use human judgment for:

- Product scope
- Pricing
- Legal decisions
- Tax decisions
- Security acceptance
- Production approval
- Business strategy

The principle:

> **AI writes more code; humans retain decision authority.**

---

# 86. Recommended First AI Sprint

Do NOT start with the full application.

### Sprint 1

Ask the agent to create:

```text
AGENTS.md
docs/PRODUCT.md
docs/ARCHITECTURE.md
docs/DATABASE.md
docs/SECURITY.md
docs/LEGAL_COMPLIANCE.md
docs/TESTING.md
docs/DECISIONS.md
tasks/TODO.md
```

Then review these documents manually.

### Sprint 2

Build:

```text
Database
Authentication
Business
Customer
```

### Sprint 3

Build:

```text
Invoice engine
Invoice editor
Tax fields
```

### Sprint 4

Build:

```text
Preview
PDF
History
```

### Sprint 5

Build:

```text
Pricing
Payments
Subscriptions
```

### Sprint 6

Build:

```text
Security
Compliance
Analytics
Production
```

---

# 87. Agent-Switching Strategy

The product must remain portable between:

- Claude Code
- Codex
- Cursor
- Antigravity
- GitHub coding agents
- Other capable coding agents

The rule is:

```text
Agent memory = temporary
Repository documentation = permanent
```

If you switch agents tomorrow, the new agent should be able to start by reading:

```text
AGENTS.md
↓
PRODUCT.md
↓
ARCHITECTURE.md
↓
SECURITY.md
↓
LEGAL_COMPLIANCE.md
↓
TASK
```

and continue the project.

---

# 88. Final AI-First Repository Principle

The repository should answer these questions without requiring a previous AI conversation:

```text
What are we building?
        ↓
docs/PRODUCT.md

How is it built?
        ↓
docs/ARCHITECTURE.md

What data exists?
        ↓
docs/DATABASE.md

What security rules apply?
        ↓
docs/SECURITY.md

What legal/tax areas need review?
        ↓
docs/LEGAL_COMPLIANCE.md

What decisions were made?
        ↓
docs/DECISIONS.md

What is currently being built?
        ↓
tasks/

How should an AI agent behave?
        ↓
AGENTS.md
```

This is the structure that makes the project **agent-portable**.

---

# 89. Final Execution Model

The complete workflow should be:

```text
                 PRODUCT IDEA
                      ↓
             PRODUCT SPECIFICATION
                      ↓
              LEGAL/CA REVIEW
                      ↓
              ARCHITECTURE FREEZE
                      ↓
                AI TASK CREATION
                      ↓
                AI IMPLEMENTATION
                      ↓
                   TESTS
                      ↓
               AI SELF-REVIEW
                      ↓
               HUMAN REVIEW
                      ↓
                  MERGE
                      ↓
               STAGING TEST
                      ↓
             PRODUCTION RELEASE
                      ↓
                 MONITORING
                      ↓
                USER FEEDBACK
                      ↓
              NEXT SMALL TASK
```

The AI should operate inside this loop instead of receiving one giant "build the SaaS" prompt.

---

# 90. Most Important Rule

**Do not build this product as one giant AI-generated project.**

Build it as a sequence of small, verifiable changes.

The best setup is:

```text
Strong product specification
        +
Common agent rules
        +
Small tasks
        +
Tests
        +
Security gates
        +
Legal review
        +
Human approval
        =
Reliable AI-built SaaS
```

The goal is not merely to get AI to write the application.

The goal is to create a repository where **any capable AI coding agent can safely understand, modify, test and continue the application without depending on the previous agent's conversation or memory.**
