# Specification

## Summary
**Goal:** Enable Admin (Owner) role users to add new staff members alongside Manager role users.

**Planned changes:**
- Update StaffManagement component to show "Add New Staff Member" button for both Owner and Manager roles
- Modify backend addStaffMember function to accept requests from both Owner and Manager roles
- Ensure Operator and Attendant roles remain restricted from adding staff members

**User-visible outcome:** Admin (Owner) users can now add new staff members through the "Add New Staff Member" button, previously available only to Manager role users.
