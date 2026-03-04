# Specification

## Summary
**Goal:** Make the Fuel Station Manager application fully responsive across all devices and allow all staff members to select custom date and time when starting or ending a shift.

**Planned changes:**
- Update all pages and components (Dashboard, SalesForm, ShiftManagement, StaffManagement, TankMonitor, SalesReports, ExpenseLogger, AnalyticsCharts, DashboardLayout) to be fully responsive for mobile, tablet, and desktop viewports
- Collapse the DashboardLayout sidebar into a hamburger/drawer menu on small screens (narrower than 768px)
- Ensure tables scroll horizontally on narrow viewports without breaking layout
- Make all form inputs and buttons touch-friendly with adequate tap target sizes (minimum 44px)
- Modify ShiftManagement so that all staff members (not just admins) can select a date and time when starting a shift and when ending a shift
- Add date and time pickers (defaulting to current date/time) to both the start shift and end shift forms
- Save the staff-selected start and end timestamps correctly to the backend shift record
- Display the accurate staff-selected timestamps in shift reports

**User-visible outcome:** The application is fully usable on phones, tablets, and desktops, and all staff members can pick a custom date and time when clocking in or out of a shift.
