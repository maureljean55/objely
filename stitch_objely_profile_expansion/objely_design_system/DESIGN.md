---
name: Objely Design System
colors:
  surface: '#fcf8fb'
  surface-dim: '#dcd9dc'
  surface-bright: '#fcf8fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f5'
  surface-container: '#f0edef'
  surface-container-high: '#eae7ea'
  surface-container-highest: '#e4e2e4'
  on-surface: '#1b1b1d'
  on-surface-variant: '#414755'
  inverse-surface: '#303032'
  inverse-on-surface: '#f3f0f2'
  outline: '#717786'
  outline-variant: '#c1c6d7'
  surface-tint: '#005bc1'
  primary: '#0058bc'
  on-primary: '#ffffff'
  primary-container: '#0070eb'
  on-primary-container: '#fefcff'
  inverse-primary: '#adc6ff'
  secondary: '#4c4aca'
  on-secondary: '#ffffff'
  secondary-container: '#6664e4'
  on-secondary-container: '#fffbff'
  tertiary: '#5a5c60'
  on-tertiary: '#ffffff'
  tertiary-container: '#737479'
  on-tertiary-container: '#fdfcff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a41'
  on-primary-fixed-variant: '#004493'
  secondary-fixed: '#e2dfff'
  secondary-fixed-dim: '#c2c1ff'
  on-secondary-fixed: '#0c006a'
  on-secondary-fixed-variant: '#3631b4'
  tertiary-fixed: '#e2e2e7'
  tertiary-fixed-dim: '#c6c6cb'
  on-tertiary-fixed: '#1a1c1f'
  on-tertiary-fixed-variant: '#45474b'
  background: '#fcf8fb'
  on-background: '#1b1b1d'
  surface-variant: '#e4e2e4'
typography:
  display:
    fontFamily: Inter
    fontSize: 34px
    fontWeight: '700'
    lineHeight: 41px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 30px
  title-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 25px
  body-lg:
    fontFamily: Inter
    fontSize: 17px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.01em
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
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
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  margin-mobile: 20px
  gutter: 16px
---

## Brand & Style

The design system is centered around a "Modern iOS-Inspired" aesthetic, blending the precision of Apple’s Human Interface Guidelines with a warmer, more approachable personality suited for a community-driven lost-and-found platform. 

The brand personality is **dependable, empathetic, and effortless**. It utilizes a **Minimalist** foundation with **Glassmorphism** accents to create a sense of depth and premium quality. The interface should feel light and airy, prioritizing content (the lost/found objects) through generous whitespace and a "soft-high-tech" finish. High-quality iconography and smooth transitions are essential to evoke a feeling of "finding relief" when using the app.

## Colors

The palette is rooted in classic iOS vibrancy but softened by a custom background.

- **Primary (Objely Blue):** Used for primary actions, active navigation states, and critical interactive elements. It represents trust and clarity.
- **Secondary (Objely Purple):** Used for decorative accents, "found" item highlights, and premium feature callouts.
- **Background (Lavender Tint):** A base of `#F2F2F7` provides a softer alternative to pure white, reducing eye strain and adding a subtle premium feel.
- **Typography:** Dark Charcoal is used for maximum legibility in headers, while Muted Gray is reserved for metadata and secondary descriptions.

## Typography

This design system utilizes **Inter** for its neutral, systematic, and highly legible qualities, mimicking the functional clarity of SF Pro while providing a slightly more modern, geometric character.

- **Scale:** Employs a tiered hierarchy where font-weight is as important as size. 
- **Display & Headlines:** Use bold weights with tighter letter spacing for a "heavy" premium look on search headers or empty-state titles.
- **Body:** Set at 17px for the primary reading experience, matching the standard iOS comfort level.
- **Alignment:** Primarily left-aligned to maintain a clean vertical rhythm in list-heavy views.

## Layout & Spacing

The layout philosophy follows a **Fluid Grid** approach with strict horizontal margins.

- **Mobile Layout:** 20px outside margins provide a "contained" feel for large cards.
- **Rhythm:** An 8pt spatial system is used for padding and margins to ensure visual harmony.
- **Stacking:** Vertical spacing between cards in a list should be 12px or 16px to maintain a distinct but cohesive flow.
- **Safe Areas:** Adhere strictly to iOS safe-area insets for the bottom tab bar and top status bars.

## Elevation & Depth

Hierarchy is established through **Tonal Layers** and **Ambient Shadows**.

- **Surface Levels:** The background is the lowest level (`#F2F2F7`). Cards sit on top of this in pure white (`#FFFFFF`).
- **Shadows:** Use extremely soft, diffused shadows to lift cards. 
  - *Token:* `0px 4px 20px rgba(0, 0, 0, 0.05)`. 
- **Separators:** Use thin (0.5pt - 1pt) borders in a slightly darker gray (`#D1D1D6`) for list items where full cards aren't used.
- **Blur:** Background blurs (20px - 30px) are applied to the Navigation Bar and Bottom Tab Bar for a native "glassy" feel.

## Shapes

The shape language is **Rounded and Friendly**. 

- **Primary Cards:** Use a 20px corner radius to evoke a modern, tactile feel.
- **Buttons:** Large buttons feature a 14px radius (squircle-like) for a comfortable touch target.
- **Interactive Elements:** Inputs and smaller UI widgets use a 12px radius. 
- **Smoothness:** Ensure all corners use "continuous corner" curves (iOS style) rather than standard geometric radii where possible in the development environment.

## Components

### Buttons
- **Primary:** Solid Objely Blue background with White text. High-padding (16px vertical).
- **Secondary:** Light blue tint background (`rgba(0,122,255,0.1)`) with Blue text.
- **Destructive:** Plain red text or light red tint background.

### Cards
- White background, 20px radius, subtle 5% opacity shadow. 
- Content inside cards should have 16px internal padding.

### Navigation (Bottom Tab Bar)
- **Icons:** Use SF Symbols or equivalent thin-stroke line icons.
- **Active State:** Icon and Label change to Objely Blue.
- **Items:** Accueil (Home), Recherche (Search), Activité (Activity), Profil (Profile).

### Inputs & Toggles
- **Input Fields:** Background-fill of `#FFFFFF` with a subtle 1px border or light gray fill `#E9E9EB`.
- **Toggles:** Standard iOS switch pattern, using Objely Blue for the "On" state.
- **Segmented Controls:** Pill-shaped background with a sliding "active" white container.

### Chips/Tags
- Small, rounded pills (100px radius) with light semantic backgrounds (e.g., Soft Green for "Found", Soft Orange for "Lost").