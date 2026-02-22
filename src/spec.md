# Specification

## Summary
**Goal:** Add owner authentication and automatic serial number management linked to Principal ID changes.

**Planned changes:**
- Implement owner/admin login using Internet Identity authentication
- Add access control so only authenticated owners can add, correct, or modify entries
- Automatically update Serial Numbers whenever a Principal ID is modified for any entry
- Display updated Serial Numbers immediately in the staff management interface

**User-visible outcome:** Owners can log in to manage staff entries (add, edit, correct), and when they modify a Principal ID, the system automatically updates and displays the corresponding Serial Number.
