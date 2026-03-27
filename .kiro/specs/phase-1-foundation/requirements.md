# Requirements Document

## Introduction

Phase 1 Foundation covers six targeted improvements to the Cronan AI platform (cronantech.com). The platform consists of a Next.js frontend deployed on Vercel and a Flask/Python backend deployed on Render with a SQLite database. This phase addresses a countdown timer update, two missing pages (Privacy Policy and Investors), email notification alerts via Resend, a critical admin authentication security fix, and expanded application forms for both trainer applicants and B2B leads.

## Glossary

- **Platform**: The Cronan AI web application, comprising the Next.js frontend and Flask backend.
- **Countdown_Timer**: The live countdown clock displayed on the home page (`/`) targeting the platform launch date.
- **Privacy_Page**: The `/privacy` route that renders the Cronan AI Privacy Policy.
- **Investors_Page**: The `/investors` route that renders the dedicated Investors & Capital Ventures page.
- **Trainer_Form**: The application form at `/agency` used by AI trainer candidates to apply.
- **B2B_Form**: The early access request form at `/b2b` used by business clients.
- **Notification_Service**: The server-side email dispatch system powered by the Resend API.
- **Admin_Dashboard**: The password-protected staff interface at `/admin`.
- **Auth_API**: The Next.js API route (`/api/auth/login`) responsible for server-side credential verification.
- **Admin_Client**: The browser-side login component within the Admin_Dashboard.
- **Backend**: The Flask/Python API server deployed on Render.
- **Resend**: The third-party transactional email service used to send notification emails.

---

## Requirements

### Requirement 1: Update Countdown Timer Target Date

**User Story:** As a site visitor, I want to see an accurate countdown to the Cronan AI launch, so that I know exactly when the platform goes live.

#### Acceptance Criteria

1. THE Countdown_Timer SHALL target August 5, 2026 at 3:00 PM Eastern Time (UTC-4 during EDT) as its end date.
2. WHEN the current time reaches or passes August 5, 2026 at 3:00 PM Eastern Time, THE Countdown_Timer SHALL display all units as zero and stop decrementing.
3. THE Countdown_Timer SHALL display days, hours, minutes, and seconds remaining, each updated every 1 second.
4. THE Countdown_Timer SHALL use the ISO 8601 datetime string `2026-08-05T15:00:00-04:00` as the target value to correctly represent Eastern Daylight Time.

---

### Requirement 2: Privacy Policy Page

**User Story:** As a site visitor, I want to access a Privacy Policy page at `/privacy`, so that I can understand how my personal data is collected and used before submitting any form.

#### Acceptance Criteria

1. WHEN a visitor navigates to `/privacy`, THE Privacy_Page SHALL render a full privacy policy document without returning a 404 error.
2. THE Privacy_Page SHALL include sections covering: data collected, how data is used, data storage and security, third-party services, user rights, and contact information.
3. THE Privacy_Page SHALL include a link back to the home page (`/`).
4. THE Privacy_Page SHALL be consistent in visual style with the rest of the Platform (dark theme, slate/cyan color palette).
5. WHEN the `/privacy` link in the footer or any form disclaimer is clicked, THE Platform SHALL navigate to the Privacy_Page without error.

---

### Requirement 3: Investors & Capital Ventures Page

**User Story:** As a potential investor, I want a dedicated page at `/investors` that presents Cronan AI's investment opportunity, so that I can evaluate the opportunity without having to locate it within the Operational Guidelines.

#### Acceptance Criteria

1. WHEN a visitor navigates to `/investors`, THE Investors_Page SHALL render a dedicated investment opportunity page without returning a 404 error.
2. THE Investors_Page SHALL present the content currently found in Article VII of `/guidelines` (vision for scalability, seed investment openness, capital allocation strategy, and investor inquiry information).
3. THE Investors_Page SHALL include a contact section with direct email links to Brianna@CronanTech.com and Bethany@CronanTech.com.
4. THE Investors_Page SHALL include a link back to the home page (`/`).
5. THE Investors_Page SHALL be consistent in visual style with the rest of the Platform (dark theme, amber/slate color palette appropriate for a financial/investment context).
6. THE Platform footer or navigation SHALL include a discoverable link to the Investors_Page.

---

### Requirement 4: Email Notifications via Resend

**User Story:** As a Cronan AI staff member, I want to receive an email alert whenever a trainer applies or a B2B lead submits a request, so that I can follow up promptly without manually checking the admin dashboard.

#### Acceptance Criteria

1. WHEN a trainer submits the Trainer_Form successfully, THE Notification_Service SHALL send an email notification to Brianna@CronanTech.com and Bethany@CronanTech.com within 30 seconds.
2. WHEN a business client submits the B2B_Form successfully, THE Notification_Service SHALL send an email notification to Brianna@CronanTech.com and Bethany@CronanTech.com within 30 seconds.
3. THE Notification_Service SHALL include the applicant's name, email, and primary specialty or project type in the notification email body.
4. IF the Resend API call fails, THEN THE Notification_Service SHALL log the error server-side and SHALL NOT prevent the form submission from being saved to the database.
5. THE Notification_Service SHALL use a Resend API key stored in a server-side environment variable (`RESEND_API_KEY`) and SHALL NOT expose the key to the client bundle.
6. THE Notification_Service SHALL send notifications from a verified sender address configured in the Resend account (e.g., `notifications@cronantech.com` or the Resend default domain).

---

### Requirement 5: Secure Admin Authentication

**User Story:** As a Cronan AI staff member, I want admin credentials to be verified server-side, so that passwords are never exposed in the client-side JavaScript bundle.

#### Acceptance Criteria

1. THE Admin_Dashboard SHALL NOT store or reference staff passwords in any `NEXT_PUBLIC_` environment variable.
2. THE Auth_API SHALL verify submitted credentials against staff passwords stored exclusively in server-side environment variables (`BRIANNA_PASSWORD`, `BETHANY_PASSWORD`).
3. WHEN a staff member submits valid credentials, THE Auth_API SHALL return a signed session token (e.g., an HTTP-only cookie or a signed JWT) that the Admin_Client uses to authenticate subsequent data requests.
4. WHEN a staff member submits invalid credentials, THE Auth_API SHALL return an HTTP 401 response and THE Admin_Client SHALL display an error message.
5. WHEN a staff member clicks "Sign Out", THE Admin_Client SHALL invalidate the session token so that subsequent page loads require re-authentication.
6. WHILE a valid session token is not present, THE Admin_Dashboard SHALL display the login form and SHALL NOT render any applicant or lead data.
7. THE Auth_API SHALL be implemented as a Next.js API route (e.g., `pages/api/auth/login` or `app/api/auth/login/route.ts`) so that credential comparison occurs exclusively on the server.

---

### Requirement 6: Expanded Trainer Application Form

**User Story:** As a Cronan AI recruiter, I want the trainer application form to collect more detailed information, so that I can evaluate candidates more thoroughly before scheduling a follow-up.

#### Acceptance Criteria

1. THE Trainer_Form SHALL include a required phone number field that accepts a standard North American or international phone number format.
2. THE Trainer_Form SHALL include an optional LinkedIn or portfolio URL field.
3. THE Trainer_Form SHALL include a required availability field indicating the applicant's available hours per week (numeric input, minimum 1, maximum 168).
4. THE Trainer_Form SHALL include a preferred work type field pre-set to "Remote Only" and displayed as a read-only or informational field reflecting Cronan AI's remote-only policy.
5. THE Trainer_Form SHALL include an optional resume upload field that accepts PDF and DOCX file formats with a maximum file size of 5 MB.
6. THE Trainer_Form SHALL include a required agreement checkbox with text confirming the applicant has read and agrees to the Cronan AI Operational Guidelines and Privacy Policy.
7. WHEN the Trainer_Form is submitted, THE Backend SHALL store all new fields (phone, LinkedIn URL, availability, resume file reference) alongside the existing applicant record.
8. IF a submitted file exceeds 5 MB or is not a PDF or DOCX, THEN THE Trainer_Form SHALL display a validation error and SHALL NOT submit the form.
9. WHEN a trainer application is submitted successfully, THE Admin_Dashboard trainer table SHALL display the new fields (phone, availability, LinkedIn URL) for each applicant record.

---

### Requirement 7: Expanded B2B Early Access Form

**User Story:** As a Cronan AI business development lead, I want the B2B form to collect richer qualification data, so that I can prioritize and tailor outreach to the most relevant prospects.

#### Acceptance Criteria

1. THE B2B_Form SHALL include a required phone number field.
2. THE B2B_Form SHALL include a required company size field with selectable ranges (e.g., 1–10, 11–50, 51–200, 201–1000, 1000+).
3. THE B2B_Form SHALL include a required industry field with selectable options relevant to AI services (e.g., Technology, Healthcare, Finance, E-commerce, Education, Other).
4. THE B2B_Form SHALL include a required budget range field with selectable ranges (e.g., Under $5K, $5K–$25K, $25K–$100K, $100K+).
5. THE B2B_Form SHALL include a required timeline field with selectable options (e.g., Immediately, Within 1 month, 1–3 months, 3–6 months, Exploring options).
6. THE B2B_Form SHALL include a required "How did you hear about us?" field with selectable options (e.g., LinkedIn, Google Search, Referral, Social Media, Other).
7. THE B2B_Form SHALL include an optional message or project description textarea (maximum 1000 characters).
8. WHEN the B2B_Form is submitted, THE Backend SHALL store all new fields alongside the existing business lead record.
9. WHEN a B2B lead is submitted successfully, THE Admin_Dashboard business leads table SHALL display the new qualification fields (phone, company size, industry, budget, timeline) for each lead record.
