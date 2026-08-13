# Security

## Authentication

- Never store plaintext passwords.
- Use Argon2id or bcrypt for password hashing.
- Use secure sessions/tokens.
- Protect account recovery.

## Authorization

Every invoice, customer, business, PDF and subscription endpoint must verify ownership server-side. Never trust a frontend resource ID alone.

## API

- Validate all input.
- Rate-limit sensitive endpoints.
- Configure CORS narrowly.
- Use security headers.
- Add CSRF protections where applicable.

## Secrets

Secrets belong in environment variables/secrets management. Never commit real credentials.

## Files

Invoice PDFs use private storage and short-lived signed URLs.

## Payments

BillFlow must not store card information. Payment webhooks must be authenticated/verified server-side.

## Logging

Do not log passwords, tokens, payment secrets, or unnecessary sensitive customer data.
