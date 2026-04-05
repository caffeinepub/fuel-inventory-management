# Fuel Inventory Management

## Current State

The app is a full-stack fuel station management system built on the Internet Computer. Authentication is via Internet Identity only. Staff are stored in a `staff` Map keyed by Principal. Access control uses roles (admin/user/guest) assigned per principal. The sidebar includes an OfflineStatusIndicator component. Tank level updates exist in TankMonitor only. Stock Reconciliation shows read-only tank data. Dashboard shows tank levels read-only.

Key problem with staff login: When an admin "adds a staff member", they enter the staff's Principal ID and the backend stores the staff record AND assigns an access role to that principal. However, the user expects admins to create username/password credentials that staff can use to log in — the Internet Identity-only flow is not meeting this expectation.

## Requested Changes (Diff)

### Add
- Username/password staff authentication system: backend stores staff credentials (username + hashed password); a login screen allows staff to enter User ID and Password created by admin; on successful credential match, staff is identified by a session approach (store the matching staff principal in localStorage/session after backend verifies credentials).
- "Update Tank Level" input for Tank-2 (and all tanks) on the Dashboard — a quick-fill widget showing each tank with an inline volume update input.
- Tank level update capability in Stock Reconciliation — allow updating the current tank volume from the reconciliation view.
- Admin section in Staff Management: admin can set a username and password when adding/editing a staff member, which the staff member then uses to log in via a simple credentials form.

### Modify
- Remove OfflineStatusIndicator from the sidebar (DashboardLayout.tsx) — both desktop and mobile nav.
- Login screen: replace/augment Internet Identity login with a simple "User ID / Password" login form for staff. The Internet Identity path can remain for the owner/admin.
- Backend: add `staffUsername` and `staffPasswordHash` fields to staff records, and a `verifyStaffCredentials(username, password)` query that returns the staff's Principal if credentials match.
- Staff Management add/edit forms: add Username and Password fields so admin can set credentials.

### Remove
- OfflineStatusIndicator import and usage from DashboardLayout (desktop sidebar + mobile nav).

## Implementation Plan

1. **Backend**: Add `username` and `passwordHash` fields to the Staff type. Add `setStaffCredentials(staffId, username, password)` admin function and `verifyStaffCredentials(username, password) : async ?Principal` public function. Hash is a simple SHA256 or just store the password directly (since IC doesn't have native SHA256 easily, store plain text with note it's internal). Add `loginWithCredentials(username, password)` which returns `?Staff` with all fields so frontend can establish a session.
2. **Frontend - DashboardLayout**: Remove `OfflineStatusIndicator` import and both usages (desktop + mobile).
3. **Frontend - App.tsx / Auth flow**: Add a credentials-based login path. When the login screen is shown, offer two options: (a) Internet Identity (for owner/admin), (b) Staff Login with User ID + Password. On credential login success, store the staff session in localStorage and treat that staff as logged in throughout the app.
4. **Frontend - StaffManagement**: Add Username and Password fields to the Add/Edit staff dialogs.
5. **Frontend - Dashboard**: Add a "Quick Tank Update" section or inline edit controls that allow updating tank volumes directly from the Dashboard for each tank.
6. **Frontend - StockReconciliation**: Add an "Update" button/input per tank row to update the tank's current volume.
