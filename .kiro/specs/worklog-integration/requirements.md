# Requirements Document

## Introduction

WorkLog Pro is a standalone time-tracking application with a Vue.js frontend and Flask backend. This feature integrates WorkLog Pro into the Cronan AI platform (cronantech.com) by merging its backend API routes into the existing Cronan Flask backend and serving its frontend as a new Next.js page at `/worklog`. The integration uses a separate `worklog.db` SQLite database, moves hardcoded secrets to environment variables, and preserves all existing WorkLog Pro functionality. The system supports multiple employee accounts managed through the database, each with isolated time records, and provides an interactive analytics dashboard for both admin and employee roles.

## Glossary

- **WorkLog_App**: The integrated WorkLog Pro time-tracking application running within the Cronan AI platform.
- **Cronan_Backend**: The existing Flask/Python backend deployed on Render at the Cronan AI platform.
- **Cronan_Frontend**: The existing Next.js (App Router) frontend deployed on Vercel at cronantech.com.
- **WorkLog_API**: The set of Flask routes prefixed with `/api/worklog/` added to the Cronan_Backend.
- **WorkLog_DB**: A separate SQLite database file (`worklog.db`) used exclusively by the WorkLog_App, stored in the same persistent disk directory as `cronan_ai.db`.
- **History_Table**: The SQLite table in WorkLog_DB with columns: `id`, `employee_id`, `week_ending`, `ref_number`, `net_pay`, `full_data` (JSON), `created_at`.
- **Users_Table**: The SQLite table in WorkLog_DB storing employee accounts with columns: `id`, `username`, `password_hash`, `is_active`, `created_at`.
- **WorkLog_Session**: A Flask server-side session that authenticates a user to the WorkLog_App, storing the authenticated username, employee ID, and role.
- **Admin_Role**: The role granting full access to all WorkLog_App features including time entry, editing, saving, deleting records, PDF reports, settings, the database view across all employees, employee account management, and the admin analytics dashboard.
- **Viewer_Role**: The role assigned to employee accounts stored in the Users_Table, granting access to the employee's own time records, their own analytics dashboard, and no access to other employees' data or admin features.
- **Employee**: A user with the Viewer_Role whose credentials are stored in the Users_Table.
- **WorkLog_Page**: The Next.js page rendered at `cronantech.com/worklog`.
- **Vue_App**: The existing Vue.js single-page application from WorkLog Pro, adapted to run within the WorkLog_Page.
- **PDF_Report**: A printable weekly time report generated from the current week's time entry data.
- **Week_Record**: A single row in the History_Table representing one completed week's time data for a specific Employee.
- **Settings**: User-configurable values (name, phone, hourly rate, locations) persisted in browser localStorage.
- **Analytics_Dashboard**: An interactive page within the Vue_App displaying charts and summary statistics for time and pay data, scoped to the authenticated user's role.
- **Chart_Library**: Chart.js loaded via CDN, used to render all Analytics_Dashboard visualizations.

---

## Requirements

### Requirement 1: Backend API Integration

**User Story:** As a developer, I want the WorkLog Pro API routes merged into the Cronan backend, so that a single backend service handles all platform functionality.

#### Acceptance Criteria

1. THE WorkLog_API SHALL expose the following routes on the Cronan_Backend: `POST /api/worklog/login`, `POST /api/worklog/logout`, `GET /api/worklog/session`, `GET /api/worklog/history`, `POST /api/worklog/save`, `POST /api/worklog/delete`, `GET /api/worklog/employees`, `POST /api/worklog/employees`, `PUT /api/worklog/employees/<id>`, `POST /api/worklog/employees/<id>/reset-password`.
2. THE WorkLog_API SHALL use a dedicated WorkLog_DB file that is separate from `cronan_ai.db`.
3. WHEN the Cronan_Backend starts, THE WorkLog_API SHALL initialize the WorkLog_DB and create the History_Table and Users_Table if they do not already exist.
4. THE WorkLog_API SHALL read admin credentials exclusively from the environment variables `WORKLOG_ADMIN_USERNAME` and `WORKLOG_ADMIN_PASSWORD`, and SHALL NOT use hardcoded credential values.
5. THE WorkLog_API SHALL read the Flask `SECRET_KEY` from the existing `SECRET_KEY` environment variable already used by the Cronan_Backend.
6. WHEN either of the admin credential environment variables (`WORKLOG_ADMIN_USERNAME`, `WORKLOG_ADMIN_PASSWORD`) are not set at startup, THE Cronan_Backend SHALL log an error identifying each missing variable by name and SHALL refuse to register the WorkLog_API routes.

---

### Requirement 2: Authentication

**User Story:** As a WorkLog Pro user, I want to log in with a username and password, so that my time records are protected and my access level is appropriate to my role.

#### Acceptance Criteria

1. WHEN a `POST /api/worklog/login` request is received with a username and password matching the admin credentials from environment variables, THE WorkLog_API SHALL create a WorkLog_Session with `role` set to `admin` and return HTTP 200 with the role in the response body.
2. WHEN a `POST /api/worklog/login` request is received with a username and password matching an active Employee record in the Users_Table, THE WorkLog_API SHALL create a WorkLog_Session with `role` set to `viewer`, `employee_id` set to the Employee's `id`, and return HTTP 200 with the role in the response body.
3. WHEN a `POST /api/worklog/login` request is received with credentials that do not match the admin credentials or any active Employee in the Users_Table, THE WorkLog_API SHALL return HTTP 401 and SHALL NOT create a WorkLog_Session.
4. WHEN a `POST /api/worklog/login` request is received with credentials matching an Employee whose `is_active` flag is false, THE WorkLog_API SHALL return HTTP 401 and SHALL NOT create a WorkLog_Session.
5. WHEN a `POST /api/worklog/logout` request is received, THE WorkLog_API SHALL clear the WorkLog_Session and return HTTP 200.
6. WHEN any WorkLog_API route other than `/api/worklog/login` is accessed without a valid WorkLog_Session, THE WorkLog_API SHALL return HTTP 401.
7. WHEN a `POST /api/worklog/save`, `POST /api/worklog/delete`, or any settings-modifying request is received with a WorkLog_Session whose `role` is `viewer`, THE WorkLog_API SHALL return HTTP 403.
8. THE WorkLog_API SHALL expose a `GET /api/worklog/session` route that returns the current session's `role`, `employee_id`, and authenticated state, returning HTTP 200 with role data if a valid session exists or HTTP 401 if no session exists.
9. THE WorkLog_API SHALL maintain WorkLog_Session state independently from any other Cronan platform sessions.

---

### Requirement 3: Time Record Persistence

**User Story:** As a WorkLog Pro user, I want to save and delete weekly time records, so that I can maintain a historical log of my work hours.

#### Acceptance Criteria

1. WHEN a `POST /api/worklog/save` request is received with valid `week_ending`, `ref_number`, `net_pay`, and `full_data` fields, THE WorkLog_API SHALL insert or replace the corresponding Week_Record in the History_Table associated with the authenticated session's `employee_id` and return HTTP 200.
2. WHEN a `POST /api/worklog/save` request is received with missing required fields, THE WorkLog_API SHALL return HTTP 400 with a descriptive error message.
3. WHEN a `POST /api/worklog/delete` request is received with a valid `id`, THE WorkLog_API SHALL delete the corresponding Week_Record from the History_Table and return HTTP 200.
4. WHEN a `POST /api/worklog/delete` request is received with an `id` that does not exist in the History_Table, THE WorkLog_API SHALL return HTTP 404.
5. WHEN a `GET /api/worklog/history` request is received with a WorkLog_Session whose `role` is `viewer`, THE WorkLog_API SHALL return only the Week_Records whose `employee_id` matches the session's `employee_id`, ordered by `week_ending` descending.
6. WHEN a `GET /api/worklog/history` request is received with a WorkLog_Session whose `role` is `admin` and no `employee_id` query parameter is provided, THE WorkLog_API SHALL return all Week_Records from the History_Table ordered by `week_ending` descending.
7. WHEN a `GET /api/worklog/history` request is received with a WorkLog_Session whose `role` is `admin` and an `employee_id` query parameter is provided, THE WorkLog_API SHALL return only the Week_Records matching that `employee_id`, ordered by `week_ending` descending.

---

### Requirement 4: Frontend Route

**User Story:** As a WorkLog Pro user, I want to access WorkLog Pro at cronantech.com/worklog, so that I can use it without running a separate server.

#### Acceptance Criteria

1. THE Cronan_Frontend SHALL serve the WorkLog_Page at the route `/worklog`.
2. THE WorkLog_Page SHALL render the Vue_App within a Next.js page component.
3. THE Vue_App SHALL communicate exclusively with the WorkLog_API using the `NEXT_PUBLIC_API_URL` environment variable as the base URL, with all requests prefixed `/api/worklog/`.
4. WHEN the WorkLog_Page is loaded, THE Vue_App SHALL call `GET /api/worklog/session` to determine the current authentication state and role before rendering any content.
5. WHEN the WorkLog_Page is loaded and no valid WorkLog_Session exists, THE Vue_App SHALL display the login screen.
6. WHEN the WorkLog_Page is loaded and a valid WorkLog_Session with `role` of `viewer` exists, THE Vue_App SHALL display only the employee's own historical records view and analytics dashboard, and SHALL hide all time entry, save, delete, PDF report, settings, and employee management controls.
7. WHEN the WorkLog_Page is loaded and a valid WorkLog_Session with `role` of `admin` exists, THE Vue_App SHALL display the full interface including time entry, save, delete, PDF report, settings, employee management, and the admin analytics dashboard.
8. THE WorkLog_Page SHALL be excluded from the Cronan_Frontend's global Header navigation links.

---

### Requirement 5: Vue.js Frontend Compatibility

**User Story:** As a WorkLog Pro user, I want the existing Vue.js interface to work correctly within the Next.js page, so that I don't lose any existing functionality.

#### Acceptance Criteria

1. THE Vue_App SHALL use `[[` and `]]` as its template delimiters to avoid conflicts with Next.js and Jinja2 syntax.
2. THE Vue_App SHALL be loaded via CDN script tags within the WorkLog_Page so that no Vue.js build step is required.
3. THE WorkLog_Page SHALL include all CSS and JavaScript dependencies required by the Vue_App inline or via CDN links, including the Chart_Library.
4. WHEN the WorkLog_Page is rendered by Next.js, THE Vue_App SHALL mount and initialize without JavaScript errors.

---

### Requirement 6: Time Entry Features

**User Story:** As the WorkLog Pro admin user, I want to enter daily start/stop times, breaks, location, and tasks, so that I can accurately track my work hours each week.

#### Acceptance Criteria

1. THE Vue_App SHALL support entry of start time, stop time, break duration, location, and task description for each workday.
2. THE Vue_App SHALL calculate net hours per day by subtracting break duration from the difference between stop time and start time.
3. WHEN weekend mode is enabled, THE Vue_App SHALL include Saturday and Sunday as enterable workdays.
4. WHEN standard week mode is active, THE Vue_App SHALL include Monday through Friday as enterable workdays.
5. WHEN the current day is Friday and auto Friday entry is enabled in Settings, THE Vue_App SHALL pre-populate the Friday row with the configured default values.
6. THE Vue_App SHALL calculate and display total net hours and total net pay for the week based on the configured hourly rate from Settings.
7. WHEN a bonus amount is entered, THE Vue_App SHALL add the bonus to the total net pay calculation.

---

### Requirement 7: PDF Report Generation

**User Story:** As the WorkLog Pro admin user, I want to print a PDF report of my weekly time entries, so that I can submit it as a timesheet.

#### Acceptance Criteria

1. THE Vue_App SHALL provide a print action that triggers the browser's print dialog for the current week's time entry data.
2. THE PDF_Report SHALL include the user's name, phone number, week ending date, reference number, daily time entries, total hours, and total net pay.
3. THE PDF_Report SHALL be formatted for standard letter-size paper in portrait orientation.
4. WHEN the print action is triggered, THE Vue_App SHALL apply print-specific CSS that hides navigation and input controls.

---

### Requirement 8: Historical Records View (Admin)

**User Story:** As the WorkLog Pro admin user, I want to search, filter, and manage saved weekly records across all employees, so that I can review and maintain past timesheets.

#### Acceptance Criteria

1. THE Vue_App SHALL display Week_Records retrieved from `GET /api/worklog/history` in a historical records view when the active role is `admin`, including an `employee` column identifying which Employee each record belongs to.
2. THE Vue_App SHALL provide a text search input that filters Week_Records by `week_ending` date or `ref_number`.
3. THE Vue_App SHALL provide an employee filter dropdown in the admin historical records view that restricts displayed Week_Records to a selected Employee.
4. WHEN a Week_Record is selected from the historical records view, THE Vue_App SHALL display the full time entry data from the `full_data` field.
5. THE Vue_App SHALL provide a delete action for each Week_Record that calls `POST /api/worklog/delete` and removes the record from the displayed list on success.

---

### Requirement 13: Viewer Historical Records View

**User Story:** As an employee (viewer) user, I want to search and filter my own historical records, so that I can look up specific records without being able to modify any data.

#### Acceptance Criteria

1. WHEN the active WorkLog_Session role is `viewer`, THE Vue_App SHALL display a read-only historical records view showing only the `week_ending`, `ref_number`, `net_pay`, and total hours columns for the authenticated Employee's own Week_Records.
2. THE Vue_App SHALL provide a text search input in the Viewer view that filters Week_Records by `week_ending` date, `ref_number`, or any keyword present in the `full_data` field.
3. THE Vue_App SHALL provide a date range filter in the Viewer view with a `from` date input and a `to` date input that restricts displayed Week_Records to those whose `week_ending` falls within the specified range.
4. WHEN both a text search term and a date range are active simultaneously, THE Vue_App SHALL apply both filters together so that only Week_Records matching both criteria are displayed.
5. WHEN the Viewer view is loaded, THE Vue_App SHALL display all of the Employee's own Week_Records with no active filters by default.
6. WHEN the active WorkLog_Session role is `viewer`, THE Vue_App SHALL NOT display delete actions, time entry controls, save controls, PDF report controls, settings controls, or employee management controls.

---

### Requirement 9: Settings

**User Story:** As the WorkLog Pro admin user, I want to configure my name, phone, hourly rate, and locations, so that reports are pre-populated with my information.

#### Acceptance Criteria

1. THE Vue_App SHALL persist Settings (name, phone, hourly rate, default locations) in browser localStorage.
2. WHEN Settings are saved, THE Vue_App SHALL immediately apply the updated values to the current week's time entry calculations and PDF_Report fields.
3. THE Vue_App SHALL provide a settings panel accessible from the main interface.
4. WHEN the Vue_App is loaded and localStorage contains previously saved Settings, THE Vue_App SHALL restore those Settings automatically.

---

### Requirement 10: Database Isolation

**User Story:** As a platform operator, I want WorkLog data stored separately from Cronan AI data, so that the two systems do not interfere with each other.

#### Acceptance Criteria

1. THE WorkLog_API SHALL read and write exclusively to WorkLog_DB and SHALL NOT access `cronan_ai.db`.
2. THE Cronan_Backend SHALL initialize WorkLog_DB using the same `DB_DIR` environment variable path used for `cronan_ai.db`, with the filename `worklog.db`.
3. WHEN WorkLog_DB is unavailable or corrupted, THE WorkLog_API SHALL return HTTP 500 and log the error, and SHALL NOT affect the availability of other Cronan_Backend routes.

---

### Requirement 11: Secret Management

**User Story:** As a platform operator, I want admin credentials stored in environment variables and employee credentials stored in the database, so that no credentials are hardcoded in the source code.

#### Acceptance Criteria

1. THE Cronan_Backend SHALL read admin WorkLog credentials exclusively from the environment variables `WORKLOG_ADMIN_USERNAME` and `WORKLOG_ADMIN_PASSWORD`.
2. THE Cronan_Backend SHALL store Employee credentials (username and bcrypt password hash) exclusively in the Users_Table within WorkLog_DB, and SHALL NOT store Employee credentials in environment variables or source code.
3. THE Cronan_Backend SHALL read the Flask session secret key exclusively from the `SECRET_KEY` environment variable.
4. THE Cronan_Frontend SHALL read the backend base URL exclusively from the `NEXT_PUBLIC_API_URL` environment variable.
5. IF either of the admin WorkLog credential environment variables are absent at startup, THEN THE Cronan_Backend SHALL log an error message identifying each missing variable by name.

---

### Requirement 12: Data Migration

**User Story:** As a platform operator, I want to migrate existing SQLite data from the previous standalone PythonAnywhere deployment to the new Render deployment, so that no historical time records are lost during the transition.

#### Acceptance Criteria

1. THE WorkLog_DB file (`worklog.db`) SHALL use a portable SQLite format that can be transferred between deployments without conversion or transformation.
2. WHEN the Cronan_Backend starts and a `worklog.db` file already exists at the configured `DB_DIR` path, THE WorkLog_API SHALL open and use the existing file without overwriting or re-initializing it.
3. WHEN the Cronan_Backend starts and no `worklog.db` file exists at the configured `DB_DIR` path, THE WorkLog_API SHALL create a new `worklog.db` file and initialize the History_Table and Users_Table schema.
4. THE WorkLog_API SHALL apply any missing schema migrations to an existing WorkLog_DB without deleting existing Week_Records or Employee accounts.
5. THE Cronan_Backend deployment documentation SHALL describe the procedure for uploading an existing `worklog.db` file to the Render persistent disk prior to first launch.
6. THE WorkLog_API SHALL support being pointed at an existing `worklog.db` file from a prior standalone deployment by configuring the `DB_DIR` environment variable to the directory containing that file, with no data loss or re-initialization of existing records.

---

### Requirement 14: Employee Account Management

**User Story:** As the WorkLog Pro admin, I want to create and manage employee accounts, so that each employee can log in and access only their own time records.

#### Acceptance Criteria

1. WHEN a `POST /api/worklog/employees` request is received with a valid `username` and `password` and a WorkLog_Session whose `role` is `admin`, THE WorkLog_API SHALL create a new Employee record in the Users_Table with `is_active` set to true, store a bcrypt hash of the password, and return HTTP 201 with the new Employee's `id` and `username`.
2. WHEN a `POST /api/worklog/employees` request is received with a `username` that already exists in the Users_Table, THE WorkLog_API SHALL return HTTP 409.
3. WHEN a `PUT /api/worklog/employees/<id>` request is received with `is_active` set to false and a WorkLog_Session whose `role` is `admin`, THE WorkLog_API SHALL set the Employee's `is_active` flag to false in the Users_Table and return HTTP 200.
4. WHEN a `POST /api/worklog/employees/<id>/reset-password` request is received with a new `password` and a WorkLog_Session whose `role` is `admin`, THE WorkLog_API SHALL update the Employee's stored password hash in the Users_Table and return HTTP 200.
5. WHEN a `GET /api/worklog/employees` request is received with a WorkLog_Session whose `role` is `admin`, THE WorkLog_API SHALL return a list of all Employee records (excluding password hashes) from the Users_Table.
6. WHEN any employee management route is accessed with a WorkLog_Session whose `role` is `viewer`, THE WorkLog_API SHALL return HTTP 403.
7. THE Vue_App SHALL provide an employee management panel accessible only to the admin role, displaying the list of Employees with controls to add a new employee, deactivate an employee, and reset an employee's password.

---

### Requirement 15: Data Scoping by Employee

**User Story:** As a platform operator, I want all time record data scoped to the authenticated employee, so that employees can only access their own records.

#### Acceptance Criteria

1. THE History_Table SHALL include an `employee_id` column that references the `id` column of the Users_Table, associating every Week_Record with a specific Employee.
2. WHEN a `POST /api/worklog/save` request is received with a WorkLog_Session whose `role` is `viewer`, THE WorkLog_API SHALL set the `employee_id` on the saved Week_Record to the session's `employee_id` and SHALL NOT allow the request to specify a different `employee_id`.
3. WHEN a `POST /api/worklog/delete` request is received with a WorkLog_Session whose `role` is `viewer`, THE WorkLog_API SHALL verify that the target Week_Record's `employee_id` matches the session's `employee_id` and SHALL return HTTP 403 if it does not.
4. THE WorkLog_API SHALL enforce employee data scoping at the database query level for all history read and write operations, and SHALL NOT rely solely on client-side filtering.
5. WHEN a `GET /api/worklog/history` request is received with a WorkLog_Session whose `role` is `admin` and an `employee_id` query parameter is provided, THE WorkLog_API SHALL return only Week_Records matching that `employee_id`.

---

### Requirement 16: Analytics Dashboard

**User Story:** As a WorkLog Pro user, I want an interactive analytics dashboard showing charts of my pay and hours over time, so that I can understand my work patterns and earnings at a glance.

#### Acceptance Criteria

1. THE Vue_App SHALL provide an Analytics_Dashboard view accessible to both `admin` and `viewer` roles.
2. WHEN the Analytics_Dashboard is loaded with a WorkLog_Session whose `role` is `viewer`, THE Vue_App SHALL populate all charts and summary statistics using only the authenticated Employee's own Week_Records.
3. WHEN the Analytics_Dashboard is loaded with a WorkLog_Session whose `role` is `admin`, THE Vue_App SHALL populate all charts and summary statistics using Week_Records across all employees by default.
4. WHEN the Analytics_Dashboard is loaded with a WorkLog_Session whose `role` is `admin`, THE Vue_App SHALL provide an employee filter control that, when a specific Employee is selected, re-populates all charts and summary statistics using only that Employee's Week_Records.
5. THE Analytics_Dashboard SHALL render a weekly pay bar chart displaying total net pay per week using the Chart_Library.
6. THE Analytics_Dashboard SHALL render a weekend vs weekday pay breakdown chart displaying the proportion of pay earned on weekends versus weekdays using the Chart_Library.
7. THE Analytics_Dashboard SHALL render a weekly hours bar chart displaying total net hours worked per week using the Chart_Library.
8. THE Analytics_Dashboard SHALL render a location breakdown chart displaying total hours or days worked per location name using the Chart_Library.
9. THE Analytics_Dashboard SHALL display the following summary statistics computed from the filtered Week_Records: total hours year-to-date, total earnings year-to-date, most worked location, and average hours per week.
10. WHEN a user hovers over a data point on any Analytics_Dashboard chart, THE Vue_App SHALL display a tooltip showing the exact value for that data point.
11. THE WorkLog_Page SHALL load the Chart_Library via CDN script tag, consistent with the CDN approach used for Vue.js.
12. WHEN the Analytics_Dashboard employee filter is changed, THE Vue_App SHALL update all charts and summary statistics without requiring a full page reload.
