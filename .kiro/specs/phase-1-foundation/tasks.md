# Implementation Plan: Phase 1 Foundation

## Overview

Seven targeted improvements delivered in dependency order: countdown fix, two new static pages, email notifications, secure admin auth, and expanded trainer and B2B forms with matching backend schema changes.

## Tasks

- [x] 1. Update countdown timer target date
  - In `frontend/app/page.tsx`, change the `targetDate` constant from `'2026-04-01T12:00:00'` to `'2026-08-05T15:00:00-04:00'`
  - Update the inline comment to reflect the new date
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 1.1 Write property test for countdown decomposition round-trip
    - **Property 1: Countdown decomposition round-trip**
    - Use `fast-check` to assert that decomposing any positive millisecond duration into days/hours/minutes/seconds and reconstructing yields the original value within a 1-second floor
    - **Validates: Requirements 1.3**

- [x] 2. Create Privacy Policy page
  - Create `frontend/app/privacy/page.tsx` as a Server Component (no `"use client"`)
  - Include sections: Data We Collect, How We Use Your Data, Data Storage & Security, Third-Party Services (Resend, Vercel, Render), Your Rights, Contact Information
  - Match dark theme: `slate-900` card, `cyan-400` accent headings, consistent with existing pages
  - Include a `<Link href="/">← Back to The Hub</Link>` at the top
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 3. Create Investors page and update navigation
  - [x] 3.1 Create `frontend/app/investors/page.tsx` as a Server Component
    - Port Article VII content (sections 7.1–7.4) from `frontend/app/guidelines/page.tsx`
    - Include amber/slate color palette appropriate for financial context
    - Include `mailto:` links to `Brianna@CronanTech.com` and `Bethany@CronanTech.com`
    - Include a `<Link href="/">← Back to The Hub</Link>`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 3.2 Remove Article VII from guidelines and add investor callout
    - Delete the Article VII `<section>` block from `frontend/app/guidelines/page.tsx`
    - Add a short callout in its place: "For investor information, visit our [Investors page](/investors)"
    - _Requirements: 3.2_

  - [x] 3.3 Add Investors link to Header and footer
    - In `frontend/components/Header.tsx`, add `{ href: '/investors', label: 'Investors', color: 'hover:text-amber-500' }` to the `links` array
    - In `frontend/app/layout.tsx` footer, add `<a href="/investors">Investors</a>` alongside the existing footer links
    - _Requirements: 3.6_

- [x] 4. Add email notifications via Resend
  - [x] 4.1 Add Resend dependency and environment variable
    - Add `resend` to `backend/requirements.txt`
    - Add `RESEND_API_KEY=` placeholder line to `backend/.env`
    - _Requirements: 4.5_

  - [x] 4.2 Implement `send_notification()` helper in `backend/app.py`
    - Add the helper after `load_dotenv()` / before route definitions
    - Signature: `def send_notification(subject: str, html_body: str) -> None`
    - Sets `resend.api_key` from `os.environ.get("RESEND_API_KEY", "")`
    - Sends to `["Brianna@CronanTech.com", "Bethany@CronanTech.com"]` from `notifications@cronantech.com`
    - Wraps the send call in `try/except Exception` and logs on failure — never raises
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [x] 4.3 Call `send_notification()` after successful DB inserts
    - In `/api/apply`: call after `conn.commit()`, passing applicant name, email, and specialty in the HTML body
    - In `/api/b2b/apply`: call after `conn.commit()`, passing company name, contact email, and project type in the HTML body
    - _Requirements: 4.1, 4.2, 4.3_

  - [x] 4.4 Write property tests for notification behavior
    - **Property 2: Valid submission triggers notification to both founders** — use Hypothesis `@given(valid_trainer_payload())`, mock `resend.Emails.send`, assert both addresses in `to` list
    - **Validates: Requirements 4.1, 4.2**
    - **Property 3: Notification email contains submitter details** — assert `payload["name"]` and `payload["email"]` appear in the HTML body
    - **Validates: Requirements 4.3**
    - **Property 4: Resend failure does not block DB save** — mock raises `Exception`, assert response is 200 and DB row exists
    - **Validates: Requirements 4.4**

- [x] 5. Checkpoint — ensure backend tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement secure admin authentication
  - [x] 6.1 Create `frontend/app/api/auth/login/route.ts`
    - `POST` handler: read `BRIANNA_PASSWORD` / `BETHANY_PASSWORD` from `process.env` (never `NEXT_PUBLIC_`)
    - Match submitted `{ email, password }` against the two staff accounts
    - On match: sign a JWT payload `{ email, name, accentColor, exp }` with `jose` using `SESSION_SECRET` env var; set HTTP-only cookie `cronan_session` (SameSite=Lax, Secure in production, 8-hour max-age); return `200 { ok: true, name, accentColor }`
    - On mismatch: return `401 { error: "Invalid credentials" }` without setting a cookie
    - `DELETE` handler: clear `cronan_session` by setting `Max-Age=0`; return `200`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.7_

  - [x] 6.2 Create `frontend/app/api/auth/session/route.ts`
    - `GET` handler: read `cronan_session` cookie, verify JWT with `SESSION_SECRET`
    - On valid token: return `200 { email, name, accentColor }`
    - On missing or invalid token: return `401`
    - _Requirements: 5.3, 5.6_

  - [x] 6.3 Create `frontend/app/api/auth/logout/route.ts`
    - `DELETE` handler: set `cronan_session` cookie `Max-Age=0` to clear it; return `200`
    - _Requirements: 5.5_

  - [x] 6.4 Update `frontend/app/admin/page.tsx` to use the new auth API
    - Remove the `STAFF` constant and all `NEXT_PUBLIC_BRIANNA_PASSWORD` / `NEXT_PUBLIC_BETHANY_PASSWORD` references
    - On mount, call `GET /api/auth/session`; if 200, set `currentUser` state from response; if 401, show login form
    - Login form `onSubmit` POSTs `{ email, password }` to `/api/auth/login`; on 200 set `currentUser`; on 401 show error
    - Sign-out button calls `DELETE /api/auth/logout` then clears `currentUser` state
    - _Requirements: 5.1, 5.3, 5.4, 5.5, 5.6_

  - [x] 6.5 Write property tests for auth API
    - **Property 5: Valid credentials produce an HTTP-only session cookie** — use `fast-check` `fc.constantFrom` over both valid emails, assert response 200 and `Set-Cookie` header includes `HttpOnly`
    - **Validates: Requirements 5.3**
    - **Property 6: Invalid credentials always return 401** — generate random `{ email, password }` pairs that don't match known accounts, assert 401 and no `Set-Cookie` header
    - **Validates: Requirements 5.4**

- [x] 7. Checkpoint — ensure auth flow works end-to-end
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Expand trainer application form and backend
  - [x] 8.1 Add `migrate_db()` to `backend/app.py` for `applicants` table
    - Implement `migrate_db()` using `ALTER TABLE applicants ADD COLUMN` wrapped in `try/except sqlite3.OperationalError` for idempotency
    - New columns: `phone TEXT`, `linkedin_url TEXT`, `availability_hours INTEGER`
    - Call `migrate_db()` after `init_db()` at startup
    - _Requirements: 6.7_

  - [x] 8.2 Update `/api/apply` to accept and validate new fields
    - Add `phone` to the required fields list; return 400 if missing
    - Accept optional `linkedinUrl` (stored as `linkedin_url`)
    - Accept `availabilityHours` (stored as `availability_hours`); validate it is an integer between 1 and 168 inclusive, return 400 otherwise
    - Update the `INSERT` statement to include the three new columns
    - _Requirements: 6.1, 6.3, 6.7_

  - [x] 8.3 Write property tests for trainer form validation
    - **Property 7: Missing required fields return 400** — use Hypothesis to generate payloads missing one required field at a time, assert 400 and no DB row
    - **Validates: Requirements 6.1, 6.3, 6.6**
    - **Property 8: New fields round-trip through the database** — generate valid extended payloads, assert saved `phone` and `availability_hours` match submitted values
    - **Validates: Requirements 6.7**
    - **Property 9: Availability hours boundary enforcement** — generate integers outside 1–168, assert 400 and no DB row
    - **Validates: Requirements 6.3**

  - [x] 8.4 Add new fields to the trainer form UI (`frontend/app/agency/page.tsx`)
    - Add `phone`, `linkedinUrl`, `availabilityHours`, `agreedToTerms` to form state
    - Add required `<input type="tel">` for phone
    - Add optional `<input type="url">` for LinkedIn/portfolio URL
    - Add required `<input type="number" min="1" max="168">` for availability hours
    - Add read-only "Remote Only" work type display field
    - Add required `<input type="checkbox">` for terms agreement (link to `/guidelines` and `/privacy`)
    - Add disabled resume upload field with "Coming soon" note
    - Include new fields in the `fetch` POST body
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

  - [x] 8.5 Update admin trainer table to show new fields
    - In `frontend/app/admin/page.tsx`, update the trainers `<table>` to add columns for Phone, Availability (hrs/wk), and LinkedIn
    - Update the `Applicant` interface to include `phone`, `availability_hours`, `linkedin_url`
    - _Requirements: 6.9_

- [x] 9. Expand B2B form and backend
  - [x] 9.1 Add `migrate_db()` columns for `business_leads` table
    - Extend `migrate_db()` (or add to it) to also `ALTER TABLE business_leads ADD COLUMN` for: `phone TEXT`, `company_size TEXT`, `industry TEXT`, `budget_range TEXT`, `timeline TEXT`, `referral_source TEXT`, `message TEXT`
    - Each wrapped in `try/except sqlite3.OperationalError`
    - _Requirements: 7.8_

  - [x] 9.2 Update `/api/b2b/apply` to accept and validate new fields
    - Add `phone`, `companySize`, `industry`, `budgetRange`, `timeline`, `referralSource` to required fields; return 400 if any are missing
    - Accept optional `message`; if present and length > 1000, return 400
    - Update the `INSERT` statement to include all new columns
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8_

  - [x] 9.3 Write property tests for B2B form validation
    - **Property 7 (B2B): Missing required fields return 400** — generate B2B payloads missing one required field, assert 400 and no DB row
    - **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5, 7.6**
    - **Property 8 (B2B): New fields round-trip through the database** — generate valid extended B2B payloads, assert all new fields saved correctly
    - **Validates: Requirements 7.8**
    - **Property 10: B2B message length enforcement** — generate strings with length > 1000, assert 400 and no DB row
    - **Validates: Requirements 7.7**

  - [x] 9.4 Add new fields to the B2B form UI (`frontend/app/b2b/page.tsx`)
    - Add `phone`, `companySize`, `industry`, `budgetRange`, `timeline`, `referralSource`, `message` to form state
    - Add required `<input type="tel">` for phone
    - Add required `<select>` for company size: 1–10, 11–50, 51–200, 201–1000, 1000+
    - Add required `<select>` for industry: Technology, Healthcare, Finance, E-commerce, Education, Other
    - Add required `<select>` for budget range: Under $5K, $5K–$25K, $25K–$100K, $100K+
    - Add required `<select>` for timeline: Immediately, Within 1 month, 1–3 months, 3–6 months, Exploring options
    - Add required `<select>` for referral source: LinkedIn, Google Search, Referral, Social Media, Other
    - Add optional `<textarea maxLength={1000}>` for message
    - Include all new fields in the `fetch` POST body
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

  - [x] 9.5 Update admin business leads table to show new fields
    - In `frontend/app/admin/page.tsx`, update the business leads `<table>` to add columns for Phone, Company Size, Industry, Budget, and Timeline
    - Update the `BusinessLead` interface to include the new fields
    - _Requirements: 7.9_

- [x] 10. Final checkpoint — ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- `migrate_db()` uses `try/except` per column so it is safe to run on an existing live database
- The resume upload field (Requirement 6.5) is rendered as a disabled/coming-soon input; file storage is deferred to Phase 2
- Property tests use Hypothesis (backend) and fast-check (frontend); run with `pytest --hypothesis-seed=0` and `jest --run` respectively
