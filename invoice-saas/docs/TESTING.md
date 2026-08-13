# Testing

## Required layers

- Unit tests for invoice calculations
- Integration tests for API/auth/data ownership
- E2E test for signup → business → customer → invoice → preview → finalize → PDF
- Security tests for IDOR/authorization, file access, webhook spoofing, rate limiting
- PDF regression tests for long names, addresses, many items, tax values, logos and page breaks

## Financial calculations

Tests must cover quantities, rates, discounts, taxes, rounding, large values, invalid inputs and approved tax branches.

## Definition of done

Requirements met + tests passing + security checked + UI verified + no unrelated regressions + docs updated + human review where required.
