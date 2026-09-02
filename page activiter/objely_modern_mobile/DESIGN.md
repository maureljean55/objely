---
name: Objely Modern Mobile
colors:
  surface: '#f8f9fe'
  surface-dim: '#d8dadf'
  surface-bright: '#f8f9fe'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3f8'
  surface-container: '#eceef3'
  surface-container-high: '#e7e8ed'
  surface-container-highest: '#e1e2e7'
  on-surface: '#191c1f'
  on-surface-variant: '#434656'
  inverse-surface: '#2e3134'
  inverse-on-surface: '#eff0f5'
  outline: '#737688'
  outline-variant: '#c3c5d9'
  surface-tint: '#004dea'
  primary: '#0041c8'
  on-primary: '#ffffff'
  primary-container: '#0055ff'
  on-primary-container: '#e3e6ff'
  inverse-primary: '#b6c4ff'
  secondary: '#5400c3'
  on-secondary: '#ffffff'
  secondary-container: '#7000ff'
  on-secondary-container: '#ddcdff'
  tertiary: '#005c3e'
  on-tertiary: '#ffffff'
  tertiary-container: '#007751'
  on-tertiary-container: '#83ffc6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b6c4ff'
  on-primary-fixed: '#001551'
  on-primary-fixed-variant: '#0039b3'
  secondary-fixed: '#e9ddff'
  secondary-fixed-dim: '#d1bcff'
  on-secondary-fixed: '#23005b'
  on-secondary-fixed-variant: '#5700c9'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#f8f9fe'
  on-background: '#191c1f'
  surface-variant: '#e1e2e7'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 34px
    fontWeight: '800'
    lineHeight: 41px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 30px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 25px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 17px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Hanken Grotesk
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  button-text:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  margin-mobile: 20px
  gutter-mobile: 12px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px
  safe-bottom: 34px
---

## Brand & Style

The design system for this mobile application is rooted in the "New iOS" aesthetic—combining the familiarity of Human Interface Guidelines with a modern, high-energy palette. It targets a broad demographic of users who have lost or found items, requiring a UI that feels both authoritative (trustworthy for high-value items) and optimistic (encouraging successful returns).

The style is characterized by **soft minimalism**. It utilizes heavy whitespace, expansive corner radii, and subtle depth through tonal layering rather than aggressive shadows. The interface must feel tactile and fluid, emphasizing ease of use during high-stress moments (like losing a wallet) through a friendly and approachable French-language interface.

## Colors

This design system utilizes a vibrant "Electric Tech" palette set against a "Soft Lavender" neutral base.

- **Primary (Objely Blue):** Used for main actions, active states, and brand-heavy components.
- **Secondary (Objely Purple):** Reserved for specialized statuses, premium features, or "Found" item categories to differentiate from "Lost" items.
- **Background:** A cool-toned #F8F9FE ensures the white cards and containers pop with distinct elevation.
- **Success/Error:** Follows standard iOS semantic colors (Green/Red) but adjusted for high saturation to match the brand.
- **Typography:** Deep charcoal (#1A1A1A) provides high legibility without the harshness of pure black.

## Typography

The typography strategy leverages **Hanken Grotesk** for its contemporary, sharp, yet approachable geometry—serving as a more characterful alternative to San Francisco while maintaining that high-end mobile feel.

- **Scale:** Utilizes an iOS-style stepped scale. 
- **Language Support:** All styles must account for French word lengths (which are typically 15-20% longer than English) by ensuring adequate line-height and flexible container widths.
- **Weight:** Heavy weights (700-800) are used for Page Titles and Object Names to create a strong visual hierarchy.
- **Labels:** **Inter** is used for secondary data and metadata for its exceptional legibility at small sizes.

## Layout & Spacing

The layout follows a **fluid mobile-first grid** with a focus on high-touch targets.

- **Margins:** A standard 20px side margin provides a "breathable" frame for content cards.
- **Vertical Rhythm:** Elements are stacked using an 8px base grid. Larger sections (e.g., separating "Détails de l'objet" from "Localisation") use 24px increments.
- **Bottom Areas:** Following modern iOS patterns, primary actions are anchored to a "Floating Bottom Area" with a background blur or solid fill, respecting the device's home indicator safe area (34px).
- **French UI Accommodation:** Containers for text must use `flex-wrap` or `overflow-ellipsis` to handle long French descriptors like "Portefeuille en cuir véritable."

## Elevation & Depth

This design system uses **Tonal Layering** combined with **Ambient Soft Shadows** to define the z-axis.

- **Level 0 (Base):** The #F8F9FE background.
- **Level 1 (Cards/Inputs):** White (#FFFFFF) surfaces with a very soft, diffused shadow: `0px 4px 20px rgba(0, 0, 0, 0.04)`.
- **Level 2 (Modals/Active States):** White surfaces with a more pronounced shadow: `0px 10px 30px rgba(0, 85, 255, 0.08)`. Note the blue-tinted shadow for active primary elements.
- **Glassmorphism:** Navigation bars and bottom action bars use a high-saturation background blur (`backdrop-filter: blur(20px)`) with 80% opacity to maintain context of the content scrolling beneath.

## Shapes

The shape language is defined by **organic, large-scale roundedness** that mimics the hardware curves of modern smartphones.

- **Standard Elements:** 16px radius for input fields, small cards, and standard buttons.
- **Large Containers:** 24px radius for main content cards and imagery to evoke a friendly, soft feel.
- **Chips/Badges:** Fully pill-shaped (100px) to contrast against the more structured rectangular cards.
- **Iconography:** Use a consistent 2pt stroke weight with rounded caps and joins to match the typography.

## Components

### Buttons & Chips
- **Primary Button:** Large (56px height), Objely Blue background, white text, 16px radius.
- **Secondary Button:** Light blue tint background (#EBF2FF) with Blue text.
- **Selectable Chips:** Used for categories (Clés, Sacs, Animaux). Unselected: White background with a thin #E0E0E0 border. Selected: Objely Blue background with White text.

### Form Fields
- **Realistic Inputs:** White background, 1px border (#E5E7EB), 16px radius. On focus, the border thickens and changes to Objely Blue with a soft glow.
- **Labels:** Positioned above the field in `label-caps` style using Dark Charcoal at 60% opacity.

### Headers & Progress
- **iOS-style Headers:** Large bold title aligned left on scroll-up; centered small title in the blurred navbar on scroll-down.
- **Step Indicators:** Horizontal bars at the top of the screen. The active step uses a gradient from Objely Blue to Purple.

### Cards (The "Found" Card)
- **Structure:** 24px radius, white surface, shadow level 1.
- **Image:** Top-anchored with 24px top radius, 0px bottom radius where it meets the text area.
- **Content:** Headline-sm for the object name, Body-sm for the location (e.g., "Trouvé à Paris, 75001").

### Bottom Action Areas
- A sticky container at the bottom of the viewport containing the "Contacter le propriétaire" or "Signaler comme trouvé" buttons, utilizing a backdrop-blur background.