---
name: Snip
colors:
  surface: '#121414'
  surface-dim: '#121414'
  surface-bright: '#383939'
  surface-container-lowest: '#0d0e0f'
  surface-container-low: '#1b1c1c'
  surface-container: '#1f2020'
  surface-container-high: '#292a2a'
  surface-container-highest: '#343535'
  on-surface: '#e3e2e2'
  on-surface-variant: '#c4c9ae'
  inverse-surface: '#e3e2e2'
  inverse-on-surface: '#303031'
  outline: '#8e937a'
  outline-variant: '#444934'
  surface-tint: '#a6d700'
  primary: '#fcffe8'
  on-primary: '#273500'
  primary-container: '#bef227'
  on-primary-container: '#526c00'
  inverse-primary: '#4e6700'
  secondary: '#c8c6c5'
  on-secondary: '#313030'
  secondary-container: '#474746'
  on-secondary-container: '#b7b5b4'
  tertiary: '#fdfcff'
  on-tertiary: '#173348'
  tertiary-container: '#c8e3ff'
  on-tertiary-container: '#4c657d'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#c0f42a'
  primary-fixed-dim: '#a6d700'
  on-primary-fixed: '#151f00'
  on-primary-fixed-variant: '#3a4d00'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474746'
  tertiary-fixed: '#cde5ff'
  tertiary-fixed-dim: '#afc9e5'
  on-tertiary-fixed: '#001d32'
  on-tertiary-fixed-variant: '#2f4960'
  background: '#121414'
  on-background: '#e3e2e2'
  surface-variant: '#343535'
typography:
  display:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.02em
  code:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 40px
  xl: 64px
  gutter: 24px
  margin: 32px
---

## Brand & Style
The design system is engineered for a high-performance, developer-centric link management platform. The brand personality is technical, precise, and unapologetically modern. It leverages a "Dark Mode First" philosophy to reduce eye strain during long sessions and aligns with the aesthetic preferences of the engineering community.

The visual style blends **Minimalism** with **High-Contrast** accents. It utilizes deep black surfaces to create an infinite depth effect, punctuated by sharp, vibrant neon highlights that guide user intent and signify action. The atmosphere is professional yet cutting-edge, evoking the feel of a premium code editor or a high-end CLI tool.

## Colors
The palette is built on a foundation of absolute black (`#000000`) to maximize OLED efficiency and visual punch. 

- **Primary (Electric Lime):** Used exclusively for primary calls to action, active states, and critical brand moments. It provides a high-contrast anchor against the dark background.
- **Surface Tiers:** Backgrounds use `#000000`. Secondary containers and cards use `#0a0a0a` to create subtle separation.
- **Borders:** Subtle grays (`#222222`) are used for structural definition without cluttering the interface.
- **Status:** Success inherits the Primary Lime; Error uses a high-vibrancy Red; Warning uses a saturated Orange.

## Typography
This design system utilizes **Geist** for its entire typographic scale to reinforce the technical, developer-friendly aesthetic. Geist provides a clean, geometric structure with a slightly condensed feel that is highly legible in data-heavy environments.

- **Headlines:** Use tighter letter spacing and heavier weights to command attention.
- **Body:** Standardized at 16px for optimal readability with a generous 1.6 line height.
- **Code:** Geist’s built-in monospaced qualities (or the Geist Mono variant) should be used for short links, API keys, and terminal snippets.

## Layout & Spacing
The layout follows a **Fixed Grid** philosophy for dashboard views to ensure consistency, while the landing experience utilizes a fluid 12-column grid.

- **Desktop:** 12 columns, 1120px max-width, 24px gutters.
- **Tablet:** 8 columns, 16px gutters, 24px side margins.
- **Mobile:** 4 columns, 16px gutters, 16px side margins.

The spacing rhythm is strictly based on a 4px baseline, but defaults to 24px (`md`) for most component gaps to ensure the "generous whitespace" required by the brand aesthetic.

## Elevation & Depth
Depth is achieved through **Tonal Layering** and **Subtle Outlines** rather than traditional shadows. Because the background is true black, shadows are largely ineffective.

- **Level 0 (Base):** `#000000` - The main canvas.
- **Level 1 (Cards/Containers):** `#0a0a0a` with a 1px solid border of `#222222`.
- **Level 2 (Popovers/Modals):** `#111111` with a slightly brighter border of `#333333`.

For high-priority items, a "Glow" effect can be used: a very low-opacity Primary Lime drop shadow (0px 0px 20px rgba(190, 242, 39, 0.15)) to make the element appear to be emitting light.

## Shapes
The shape language is characterized by large, friendly radii that contrast with the sharp, technical typography.

- **Standard Elements:** 0.5rem (8px) for buttons and inputs.
- **Large Containers:** 1.5rem (24px) for cards and main content areas (`rounded-xl` / `2xl` equivalents).
- **Interactive States:** On hover, certain elements may transition from 8px to 12px to provide a "squishy" tactile feel.

## Components
- **Buttons:**
    - **Primary:** Background Primary Lime (`#bef227`), Text Black (`#000000`), Bold.
    - **Secondary:** Transparent background, 1px border `#222222`, Text White. Hover state fills the border with `#ffffff`.
- **Input Fields:** Background `#0a0a0a`, 1px border `#222222`. Focus state changes border to Primary Lime and adds a subtle glow.
- **Cards:** Use `rounded-xl` (1.5rem). Background `#0a0a0a`. Padding should be a minimum of `md` (24px).
- **Chips/Badges:** Small, all-caps labels with `#1a1a1a` backgrounds and Primary Lime text for active status.
- **Link Display:** Shortened URLs should always be presented in a monospaced font weight to highlight the specific "slug" generated.
- **Copy Tool:** A prominent "Copy" button sits inside the URL input, using a Ghost style (no background) that turns Primary Lime on hover.