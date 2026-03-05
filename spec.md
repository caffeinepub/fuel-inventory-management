# Fuel Inventory Management

## Current State
- Full-stack fuel station management app with sidebar layout, mobile drawer, and main content area
- Dashboard has stat cards (Active Alerts, Current Shift, Today's Sales, Tank Status) with plain styling
- Tank monitor uses basic Progress bars with minimal color differentiation
- DashboardLayout has a dark sidebar (indigo/purple gradient) and orange active nav states
- index.css has custom gradient classes (stat-card-orange, stat-card-teal, stat-card-purple, stat-card-green) defined but underutilized in Dashboard.tsx
- Dashboard stat cards use plain white Card components with muted icons
- Tank level bars use only primary/destructive colors with no gradient or visual richness
- Responsive layout exists (md:hidden/hidden md:flex) but content area needs touch-friendly sizing improvements on mobile/tablet

## Requested Changes (Diff)

### Add
- Colorful gradient stat cards on Dashboard using the existing CSS classes (stat-card-orange, stat-card-teal, stat-card-purple, stat-card-green) with white text, large icons, and glow shadow effects
- Vivid multi-color tank level progress bars: petrol tanks in green gradient, diesel tanks in blue gradient, low-level tanks in red/amber gradient — with animated fill and percentage badge
- Tank cards with fuel-type color coding: petrol cards with green accent border/header, diesel cards with blue accent border/header
- "Tank Overview" section in Dashboard upgraded to show colorful mini progress bars matching tank type colors
- Quick Actions section with colorful icon chips per action
- Responsive touch improvements: increase tap targets to min 48px on all buttons, form inputs, and nav links; ensure text doesn't overflow on small screens

### Modify
- Dashboard stat cards: replace plain Card with colored gradient cards using the CSS utility classes, add matching colored icon backgrounds, increase font size for numbers
- Tank progress bars in TankMonitor: replace plain Progress with custom styled div bars using fuel-type color gradients
- DashboardLayout mobile header: ensure offline indicator and content scroll correctly on small screens
- All page headings: add the page-header-accent (left orange border) styling for visual hierarchy
- Form layouts throughout the app: ensure all inputs stack single-column on mobile (sm:grid-cols-1 on small screens)

### Remove
- Nothing removed

## Implementation Plan
1. Update Dashboard.tsx:
   - Apply stat-card-orange to Active Alerts card, stat-card-teal to Current Shift, stat-card-green to Today's Sales, stat-card-purple to Tank Status
   - Add colored icon containers inside each card with matching hue icon
   - Upgrade Tank Overview mini bars to use green (petrol) and blue (diesel) gradients
   - Upgrade Quick Actions links with colored left-border accent and icon chips

2. Update TankMonitor.tsx:
   - Replace `<Progress>` component with custom colored div-based bars
   - Petrol: green gradient bar; Diesel: blue gradient bar; Low: red/amber pulsing bar
   - Add fuel type color chip/badge at card top
   - Add subtle colored border-top or card accent per fuel type

3. Update DashboardLayout.tsx:
   - Ensure all nav link min-height is 48px (already 44px, bump to 48px)
   - Ensure main content padding is responsive (p-3 on xs, p-4 on sm, p-6 on md+)

4. Update index.css:
   - Add petrol-bar and diesel-bar gradient utilities for progress bars
   - Add tank-card-petrol and tank-card-diesel colored card accent classes

5. Apply page-header-accent class to page titles across Dashboard for consistent visual hierarchy

6. Validate TypeScript, lint, and build pass
