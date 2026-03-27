# Implementation Plan: WorkLog Integration

## Overview

Integrate WorkLog Pro into the Cronan AI platform by adding a Flask Blueprint to the existing backend, initializing a separate `worklog.db` SQLite database, and serving the Vue.js SPA as a Next.js page at `/worklog`. Implementation proceeds backend-first, then frontend, then analytics, then tests.

## Tasks

- [x] 1. Backend dependencies and environment setup
  - Add `flask-session` and `bcrypt` to `backend/requirements.txt`
  - Verify `SECRET_KEY`, `WORKLOG_ADMIN_USERNAME`, `WORKLOG_ADMIN_PASSWORD`, and `DB_DIR` env var names match what `app.py` already uses
  - _Requirements: 1.4, 1.5, 11.1, 11.3_

- [x] 2. WorkLog database initialization and migration
  - [x] 2.1 Create `backend/worklog_api.py` with `init_worklog_db()` function
    - Open `worklog.db` from `DB_DIR` (same path as `cronan_ai.db`)
    - `CREATE TABLE IF NOT EXISTS users (...)` per schema in design
    - `CREATE TABLE IF NOT EXISTS history (...)` per schema in design
    - `ALTER TABLE history ADD COLUMN employee_id ...` wrapped in try/except for idempotency
    - `ALTER TABLE history ADD COLUMN created_at ...` same pattern
    - _Requirements: 1.2, 1.3, 10.2, 12.2, 12.3, 12.4_

  - [ ]* 2.2 Write property test for schema migration preserving existing records
    - **Property 13: Schema migration preserves existing records**
    - **Validates: Requirements 12.4**

- [x] 3. Auth decorators and session helpers
  - [x] 3.1 Add `worklog_login_required` and `admin_required` decorator functions in `worklog_api.py`
    - `worklog_login_required`: checks `session.get('worklog_user')`, returns 401 if absent
    - `admin_required`: checks `session['worklog_user']['role'] == 'admin'`, returns 403 if not
    - _Requirements: 2.6, 2.7, 14.6_

  - [ ]* 3.2 Write property test for protected routes requiring a valid session
    - **Property 3: Protected routes require a valid session**
    - **Validates: Requirements 2.6**

  - [ ]* 3.3 Write property test for viewer role blocked from write operations
    - **Property 4: Viewer role is blocked from write operations**
    - **Validates: Requirements 2.7**

- [x] 4. Authentication routes
  - [x] 4.1 Implement `POST /api/worklog/login`
    - Check admin env var credentials first; on match set `session['worklog_user']` with `role='admin'`, `employee_id=0`
    - Check Users_Table for active employee match using `bcrypt.checkpw`; on match set session with `role='viewer'`
    - Return 401 for no match or inactive employee
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 4.2 Implement `POST /api/worklog/logout`
    - Pop `worklog_user` from session, return 200
    - _Requirements: 2.5_

  - [x] 4.3 Implement `GET /api/worklog/session`
    - Return `{authenticated, role, employee_id}` from session or 401 if absent
    - _Requirements: 2.8, 2.9_

  - [ ]* 4.4 Write property test for invalid credentials always returning 401
    - **Property 1: Invalid credentials always return 401**
    - **Validates: Requirements 2.3**

  - [ ]* 4.5 Write property test for login-logout round trip clearing session
    - **Property 2: Login-logout round trip clears session**
    - **Validates: Requirements 2.5**

  - [ ]* 4.6 Write property test for WorkLog session isolation from Cronan sessions
    - **Property 5: WorkLog session is isolated from Cronan platform sessions**
    - **Validates: Requirements 2.9**

- [x] 5. Time record routes
  - [x] 5.1 Implement `POST /api/worklog/save`
    - Validate required fields (`week_ending`, `ref_number`, `net_pay`, `full_data`); return 400 with field name on missing
    - Use `INSERT OR REPLACE` with `employee_id` from session (0 for admin, session value for viewer)
    - Viewer session: ignore any `employee_id` in request body, always use session value
    - _Requirements: 3.1, 3.2, 15.1, 15.2_

  - [x] 5.2 Implement `POST /api/worklog/delete`
    - Require `id` field; return 404 if record not found
    - For viewer session: verify record's `employee_id` matches session's `employee_id`, return 403 if not
    - _Requirements: 3.3, 3.4, 15.3_

  - [x] 5.3 Implement `GET /api/worklog/history`
    - Viewer: `WHERE employee_id = session_employee_id ORDER BY week_ending DESC`
    - Admin with no query param: return all records `ORDER BY week_ending DESC`
    - Admin with `?employee_id=<n>`: filter to that employee
    - _Requirements: 3.5, 3.6, 3.7, 15.4, 15.5_

  - [ ]* 5.4 Write property test for save-retrieve round trip
    - **Property 6: Save-retrieve round trip**
    - **Validates: Requirements 3.1**

  - [ ]* 5.5 Write property test for save with missing fields returning 400
    - **Property 7: Save with missing fields returns 400**
    - **Validates: Requirements 3.2**

  - [ ]* 5.6 Write property test for save-delete-retrieve round trip
    - **Property 8: Save-delete-retrieve round trip**
    - **Validates: Requirements 3.3**

  - [ ]* 5.7 Write property test for viewer history scoped to their employee_id
    - **Property 9: Viewer history is scoped to their own employee_id**
    - **Validates: Requirements 3.5, 15.2**

  - [ ]* 5.8 Write property test for admin history filtered by employee_id param
    - **Property 10: Admin history filtered by employee_id param returns only matching records**
    - **Validates: Requirements 3.7, 15.5**

  - [ ]* 5.9 Write property test for viewer save always setting correct employee_id
    - **Property 21: Viewer save always sets employee_id to session's employee_id**
    - **Validates: Requirements 15.2**

  - [ ]* 5.10 Write property test for viewer cannot delete another employee's record
    - **Property 22: Viewer cannot delete another employee's record**
    - **Validates: Requirements 15.3**

- [x] 6. Employee management routes
  - [x] 6.1 Implement `GET /api/worklog/employees`
    - Return all Users_Table rows excluding `password_hash`, admin-only
    - _Requirements: 14.5_

  - [x] 6.2 Implement `POST /api/worklog/employees`
    - Validate `username` and `password` present; hash password with `bcrypt`
    - Insert into Users_Table; return 201 with `{id, username}` or 409 on duplicate
    - _Requirements: 14.1, 14.2_

  - [x] 6.3 Implement `PUT /api/worklog/employees/<id>`
    - Update `is_active` flag; return 200
    - _Requirements: 14.3_

  - [x] 6.4 Implement `POST /api/worklog/employees/<id>/reset-password`
    - Hash new password with `bcrypt`, update Users_Table row; return 200
    - _Requirements: 14.4_

  - [ ]* 6.5 Write property test for employee creation enabling login
    - **Property 17: Employee creation enables login**
    - **Validates: Requirements 14.1**

  - [ ]* 6.6 Write property test for deactivating an employee preventing login
    - **Property 18: Deactivating an employee prevents login**
    - **Validates: Requirements 14.3**

  - [ ]* 6.7 Write property test for password reset enabling login with new password
    - **Property 19: Password reset enables login with new password**
    - **Validates: Requirements 14.4**

  - [ ]* 6.8 Write property test for employee list never exposing password hashes
    - **Property 20: Employee list never exposes password hashes**
    - **Validates: Requirements 14.5**

- [x] 7. Register blueprint and database isolation
  - [x] 7.1 Create `init_worklog(app)` function in `worklog_api.py`
    - Check `WORKLOG_ADMIN_USERNAME` and `WORKLOG_ADMIN_PASSWORD` env vars; log error and return without registering if either is missing
    - Call `init_worklog_db()`, then `app.register_blueprint(worklog_bp, url_prefix='/api/worklog')`
    - _Requirements: 1.1, 1.6, 10.3, 11.5_

  - [x] 7.2 Add import and call in `backend/app.py`
    - `from worklog_api import worklog_bp, init_worklog` after existing imports
    - `init_worklog(app)` after `migrate_db()` call
    - _Requirements: 1.1_

  - [ ]* 7.3 Write property test for database isolation between worklog.db and cronan_ai.db
    - **Property 11: Database isolation between worklog.db and cronan_ai.db**
    - **Validates: Requirements 1.2, 10.1**

  - [ ]* 7.4 Write property test for WorkLog_DB unavailability not affecting other Cronan routes
    - **Property 12: WorkLog_DB unavailability does not affect other Cronan routes**
    - **Validates: Requirements 10.3**

- [ ] 8. Backend unit tests
  - [ ]* 8.1 Write unit tests for auth and session routes in `backend/test_worklog.py`
    - `test_login_admin_success`, `test_login_employee_success`, `test_login_inactive_employee`
    - `test_session_endpoint_authenticated`, `test_session_endpoint_unauthenticated`
    - `test_missing_env_vars_skips_registration`
    - Use pytest fixture with in-memory SQLite and mocked env vars per design
    - _Requirements: 2.1, 2.2, 2.4, 2.8, 1.6_

  - [ ]* 8.2 Write unit tests for record and employee routes
    - `test_delete_nonexistent_record`, `test_duplicate_username`
    - `test_history_admin_no_filter`, `test_db_init_creates_tables`
    - _Requirements: 3.4, 14.2, 3.6, 1.3_

- [-] 9. Checkpoint — backend complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Next.js worklog page scaffold
  - [x] 10.1 Create `frontend/app/worklog/page.tsx` as a `"use client"` component
    - Render a full-viewport `<div>` with `id="worklog-root"` that receives the Vue app HTML via `dangerouslySetInnerHTML`
    - Inject Vue 3 CDN and Chart.js CDN via `next/script` with `strategy="beforeInteractive"`
    - Read `NEXT_PUBLIC_API_URL` and pass it as a `data-api-url` attribute on the mount element
    - _Requirements: 4.1, 4.2, 4.3, 5.2, 5.3_

  - [x] 10.2 Exclude `/worklog` from the global Header navigation
    - Confirm `frontend/components/Header.tsx` `links` array does not include `/worklog`
    - _Requirements: 4.8_

- [x] 11. Vue app — login screen and session bootstrap
  - [x] 11.1 Create `frontend/app/worklog/worklog-app.html` with the Vue 3 app template string
    - Set `delimiters: ['[[', ']]']` in the Vue app options
    - On `mounted()`, call `GET /api/worklog/session` using `API_BASE` from `data-api-url`; set `role` reactive property
    - Show login form when `role === null` and session returns 401
    - _Requirements: 4.4, 4.5, 5.1, 5.4_

  - [x] 11.2 Implement login form submission
    - `POST /api/worklog/login` with username/password; on 200 set `role` from response and hide login form
    - On 401 display error message
    - _Requirements: 2.1, 2.2_

- [x] 12. Vue app — admin interface (time entry, save, delete, PDF, settings)
  - [x] 12.1 Implement time entry grid (admin only)
    - Days array (Mon–Fri, optionally Sat–Sun when weekend mode enabled)
    - Fields per day: start time, stop time, break duration, location, task description
    - Computed net hours per day: `(stop - start) - break`; total net hours and net pay from Settings hourly rate
    - Bonus field added to total net pay
    - Auto Friday pre-population from Settings when enabled
    - Show/hide controlled by `role === 'admin'`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

  - [x] 12.2 Implement save and delete actions (admin only)
    - Save: `POST /api/worklog/save` with current week data; refresh history list on success
    - Delete: `POST /api/worklog/delete` with record `id`; remove from displayed list on success
    - _Requirements: 3.1, 3.3, 8.5_

  - [x] 12.3 Implement PDF report print action (admin only)
    - Trigger `window.print()` with print-specific CSS hiding nav and input controls
    - Report includes name, phone, week ending, ref number, daily entries, total hours, total net pay
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [x] 12.4 Implement Settings panel (admin only)
    - Fields: name, phone, hourly rate, default locations
    - Persist to `localStorage`; restore on app load; apply immediately to time entry calculations
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [ ]* 12.5 Write property test for Settings localStorage round trip
    - **Property 25: Settings localStorage round trip**
    - **Validates: Requirements 9.1**

  - [ ]* 12.6 Write property test for net hours calculation correctness
    - **Property 23: Net hours calculation correctness**
    - **Validates: Requirements 6.2**

- [x] 13. Vue app — admin historical records view
  - [x] 13.1 Implement admin history tab
    - Fetch `GET /api/worklog/history` on load; display table with `employee`, `week_ending`, `ref_number`, `net_pay` columns
    - Text search input filtering by `week_ending` or `ref_number`
    - Employee filter dropdown restricting to selected employee
    - Click row to display full `full_data` time entry detail
    - Delete button per row calling `POST /api/worklog/delete`
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 14. Vue app — employee management panel (admin only)
  - [x] 14.1 Implement employee management panel
    - Fetch `GET /api/worklog/employees` on open; display list with username and active status
    - Add employee form: username + password → `POST /api/worklog/employees`; show 409 error on duplicate
    - Deactivate button → `PUT /api/worklog/employees/<id>` with `{is_active: false}`
    - Reset password form → `POST /api/worklog/employees/<id>/reset-password`
    - Panel hidden for viewer role
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.7_

- [x] 15. Vue app — viewer historical records view
  - [x] 15.1 Implement viewer history view (read-only)
    - Fetch `GET /api/worklog/history` (scoped by backend to session employee_id)
    - Display `week_ending`, `ref_number`, `net_pay`, total hours columns only — no delete, save, or edit controls
    - Text search filtering by `week_ending`, `ref_number`, or keyword in `full_data`
    - Date range filter with `from` and `to` date inputs filtering by `week_ending`
    - Both filters applied simultaneously when both are active
    - Default: all records shown with no active filters
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6_

  - [ ]* 15.2 Write property test for viewer text search returning only matching records
    - **Property 14: Viewer text search returns only matching records**
    - **Validates: Requirements 13.2**

  - [ ]* 15.3 Write property test for date range filter returning only in-range records
    - **Property 15: Date range filter returns only in-range records**
    - **Validates: Requirements 13.3**

  - [ ]* 15.4 Write property test for combined text and date filters applying both criteria
    - **Property 16: Combined text and date filters apply both criteria simultaneously**
    - **Validates: Requirements 13.4**

- [x] 16. Analytics dashboard
  - [x] 16.1 Add Analytics tab to Vue app (both roles)
    - Tab visible to both `admin` and `viewer`
    - On tab open, fetch history records scoped to role (admin: all or filtered by employee; viewer: own records)
    - Admin: show employee filter dropdown that re-fetches and re-renders all charts on change
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.12_

  - [x] 16.2 Implement weekly pay bar chart
    - X-axis: week ending dates; Y-axis: total net pay per week
    - Tooltips showing exact value on hover
    - _Requirements: 16.5, 16.10_

  - [x] 16.3 Implement weekend vs weekday pay breakdown chart
    - Parse `full_data` JSON to determine weekend vs weekday pay split
    - Render as pie or doughnut chart via Chart.js CDN
    - Tooltips on hover
    - _Requirements: 16.6, 16.10_

  - [x] 16.4 Implement weekly hours bar chart
    - X-axis: week ending dates; Y-axis: total net hours per week
    - Tooltips on hover
    - _Requirements: 16.7, 16.10_

  - [x] 16.5 Implement location breakdown chart
    - Parse `full_data` to aggregate hours/days per location name
    - Render as bar or pie chart via Chart.js CDN
    - Tooltips on hover
    - _Requirements: 16.8, 16.10_

  - [x] 16.6 Implement summary statistics panel
    - Compute from filtered records: total hours YTD, total earnings YTD, most worked location, average hours per week
    - Update when employee filter changes
    - _Requirements: 16.9, 16.12_

  - [ ]* 16.7 Write property test for summary statistics correctly computed from filtered records
    - **Property 24: Summary statistics are correctly computed from filtered records**
    - **Validates: Requirements 16.9**

- [ ] 17. Frontend unit tests
  - [ ]* 17.1 Write vitest unit tests for the worklog page and header
    - `test_worklog_page_renders` — page component mounts without errors
    - `test_header_excludes_worklog_link` — Header `links` array does not contain `/worklog`
    - `test_login_screen_shown_when_no_session` — login form visible when session returns 401
    - `test_admin_controls_hidden_for_viewer` — admin UI elements absent for viewer role
    - `test_viewer_controls_hidden_for_admin` — viewer-only elements absent for admin role
    - _Requirements: 4.5, 4.6, 4.7, 4.8_

- [x] 18. Final checkpoint — wire everything together
  - [x] 18.1 Verify `init_worklog(app)` is called in `backend/app.py` after `migrate_db()`
  - [x] 18.2 Verify `frontend/app/worklog/page.tsx` imports `worklog-app.html` and passes `NEXT_PUBLIC_API_URL`
  - [x] 18.3 Confirm all `/api/worklog/*` routes return expected responses end-to-end via automated tests
  - _Requirements: 1.1, 4.3_

- [x] 19. Final checkpoint — ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- `employee_id = 0` is the reserved admin ID; admin-saved records use this value
- The Vue app is embedded via `dangerouslySetInnerHTML` — no Vue build step required
- Backend tests use an in-memory SQLite fixture and mocked env vars (see design testing strategy)
- Frontend property tests use `fast-check`; backend property tests use `hypothesis`
- Each property test references its property number and requirements clause from the design document
