---
name: Clinical Precision
colors:
  surface: '#f7fafc'
  surface-dim: '#d7dadc'
  surface-bright: '#f7fafc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f4f6'
  surface-container: '#ebeef0'
  surface-container-high: '#e5e9eb'
  surface-container-highest: '#e0e3e5'
  on-surface: '#181c1e'
  on-surface-variant: '#44474e'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eef1f3'
  outline: '#74777f'
  outline-variant: '#c4c6cf'
  surface-tint: '#495f84'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#001b3d'
  on-primary-container: '#6f84ac'
  inverse-primary: '#b1c7f2'
  secondary: '#00629f'
  on-secondary: '#ffffff'
  secondary-container: '#4bacfe'
  on-secondary-container: '#003e67'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#351001'
  on-tertiary-container: '#b2755b'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d6e3ff'
  primary-fixed-dim: '#b1c7f2'
  on-primary-fixed: '#001b3d'
  on-primary-fixed-variant: '#31476b'
  secondary-fixed: '#cfe4ff'
  secondary-fixed-dim: '#9acbff'
  on-secondary-fixed: '#001d34'
  on-secondary-fixed-variant: '#004a79'
  tertiary-fixed: '#ffdbcd'
  tertiary-fixed-dim: '#fdb698'
  on-tertiary-fixed: '#351001'
  on-tertiary-fixed-variant: '#6b3a24'
  background: '#f7fafc'
  on-background: '#181c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-sm:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-bold:
    fontFamily: Hanken Grotesk
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
  headline-md-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  margin-mobile: 12px
---

## Brand & Style

This design system is engineered for high-utility pharmaceutical and retail operations. The brand personality is **authoritative, efficient, and reliable**, prioritizing data density and rapid cognitive processing. 

The aesthetic follows a **Corporate / Modern** style with high-density information architecture. It utilizes a structured sidebar for navigation and a high-contrast dashboard layout to ensure that critical metrics (like low stock or total sales) are immediately actionable. The visual language is defined by sharp utility, clear categorization through color, and a systematic approach to data visualization.

Targeting pharmacy owners and staff, the UI evokes a sense of **control and stability**, ensuring that complex inventory and financial data feel manageable and precise.

## Colors

The palette is anchored by a deep **Navy Primary (#001B3D)** used for structural navigation, providing a grounded, professional foundation. This is contrasted against a **Vibrant Blue (#0086D6)** for primary actions and active states.

Functional color coding is critical for status tracking:
- **Success (Green):** Purchases and positive growth.
- **Danger (Red):** Expenses and critical stock alerts.
- **Warning (Orange):** Low stock and attention-required items.
- **Accent (Purple):** Credit and secondary financial metrics.
- **Info (Teal):** Product counts and general data.

The background uses a light neutral gray to reduce eye strain during long shifts, while white surfaces isolate data containers.

## Typography

The design system utilizes **Hanken Grotesk** across all levels to maintain a sharp, technical, and modern appearance. The typeface was chosen for its high legibility in data-heavy tables and small-scale labels.

- **Weight Strategy:** Bold weights (700) are reserved for financial totals and primary page titles. Medium weights (600) are used for table headers and card titles to provide structural hierarchy.
- **Scaling:** On mobile devices, headline sizes scale down slightly to preserve horizontal space, while body text remains at 14px to ensure readability in fast-paced environments.
- **Numerical Data:** Tabular figures are prioritized, ensuring that columns of prices and quantities align perfectly for quick scanning.

## Layout & Spacing

This design system employs a **Fluid Grid** model with a sidebar-content architecture. 

- **Desktop:** A fixed 260px sidebar on the left, with the main content area utilizing a 12-column grid. Gutters are kept tight at 16px to maximize information density.
- **Mobile:** The sidebar collapses into a hamburger menu or a bottom navigation bar. Content cards stack vertically, and horizontal margins are reduced to 12px to give the data as much screen real estate as possible.
- **Rhythm:** An 8pt spacing system governs all internal padding. Status cards use 16px internal padding, while data table rows are condensed to 8px-12px vertical padding to display more rows per screen.

## Elevation & Depth

Hierarchy is established primarily through **Tonal Layers** rather than heavy shadows. 

1. **Floor:** The background (#F4F7F9) acts as the base.
2. **Cards:** White surfaces (#FFFFFF) represent the primary data layer, using a very subtle, low-opacity neutral shadow (4px blur, 5% opacity) to separate them from the floor.
3. **Sidebar:** The highest contrast element, the dark navy sidebar, sits on the same plane but uses its deep color to suggest a "fixed" structural depth.
4. **Active States:** Subtle 1px inset borders are used for focused inputs, while primary buttons use solid fills to appear "pressed" or "raised" against the light UI.

## Shapes

The shape language is **Soft (0.25rem)**, leaning towards a professional, architectural feel. 

- **Primary Components:** Buttons, input fields, and status cards use a 4px (0.25rem) corner radius. This provides a clean, modern look without feeling overly "consumer-friendly" or soft.
- **Tags & Chips:** Use a slightly higher radius (rounded-lg / 8px) to distinguish them from actionable buttons.
- **Selection States:** Row highlights in tables remain sharp or use minimal 4px rounding to maintain the grid's structural integrity.

## Components

### Buttons
Primary buttons use the Vibrant Blue (#0086D6) with white text and a 4px radius. Action buttons in the dashboard (Quick Actions) are full-width on mobile and color-coded to match their respective data categories (e.g., "Add Purchase" is green).

### Status Cards
Rectangular containers with solid header backgrounds. The icon and title are placed in the header, with the primary metric (e.g., "Rs. 24,280") displayed in a large, bold font in the body. Mobile cards stack into a single column.

### Data Tables
Tables use a dark header (#001B3D) with white text for maximum contrast. Rows alternate with a very subtle gray stripe. On mobile, tables transform into "Data Cards" where each row is represented as a standalone card to avoid horizontal scrolling.

### Input Fields
Clean, white backgrounds with a 1px gray border (#D1D5DB). Focus states utilize a 2px Vibrant Blue border. Labels are positioned above the field in **label-bold** typography.

### Alerts (Low Stock)
Warning-orange border and text. On the dashboard, these appear in a scrollable list with a "0 left" badge in red to create immediate urgency.