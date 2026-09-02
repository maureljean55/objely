---
name: Objely Premium Search
colors:
  surface: '#faf9fe'
  surface-dim: '#dad9df'
  surface-bright: '#faf9fe'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f3f8'
  surface-container: '#eeedf3'
  surface-container-high: '#e9e7ed'
  surface-container-highest: '#e3e2e7'
  on-surface: '#1a1b1f'
  on-surface-variant: '#424654'
  inverse-surface: '#2f3034'
  inverse-on-surface: '#f1f0f5'
  outline: '#737785'
  outline-variant: '#c3c6d6'
  surface-tint: '#0056d2'
  primary: '#0040a1'
  on-primary: '#ffffff'
  primary-container: '#0056d2'
  on-primary-container: '#ccd8ff'
  inverse-primary: '#b2c5ff'
  secondary: '#4c4aca'
  on-secondary: '#ffffff'
  secondary-container: '#6664e4'
  on-secondary-container: '#fffbff'
  tertiary: '#822800'
  on-tertiary: '#ffffff'
  tertiary-container: '#a93802'
  on-tertiary-container: '#ffcebd'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2ff'
  primary-fixed-dim: '#b2c5ff'
  on-primary-fixed: '#001847'
  on-primary-fixed-variant: '#0040a1'
  secondary-fixed: '#e2dfff'
  secondary-fixed-dim: '#c2c1ff'
  on-secondary-fixed: '#0c006a'
  on-secondary-fixed-variant: '#3631b4'
  tertiary-fixed: '#ffdbcf'
  tertiary-fixed-dim: '#ffb59b'
  on-tertiary-fixed: '#380d00'
  on-tertiary-fixed-variant: '#812800'
  background: '#faf9fe'
  on-background: '#1a1b1f'
  surface-variant: '#e3e2e7'
typography:
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 34px
    fontWeight: '700'
    lineHeight: 41px
    letterSpacing: -0.4px
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.2px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 17px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: -0.4px
  body-sm:
    fontFamily: Hanken Grotesk
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: -0.2px
  label-caps:
    fontFamily: Hanken Grotesk
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.1px
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.4px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  margin-page: 16px
  gutter: 12px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px
---

## Brand & Style

The design system is engineered for **Objely**, a high-end iOS utility focused on object retrieval and inventory management. The brand personality is efficient, dependable, and sophisticated, mirroring the precision of a professional tool while maintaining the approachability of a premium consumer app.

The aesthetic follows a **Corporate / Modern** style heavily influenced by Human Interface Guidelines (HIG). It prioritizes functional clarity over decorative flair, utilizing ample whitespace, a systematic grid, and subtle depth to guide the user. The emotional response should be one of "effortless organization"—users should feel that their physical world is digitally indexed with mathematical precision. Avoid all "playful" trends; the interface must feel institutional and authoritative.

## Colors

The palette is anchored by **Deep Objely Blue**, a more saturated and professional evolution of the standard system blue. It serves as the primary action color for buttons, active states, and critical information.

- **Primary:** Used for high-emphasis actions and branding moments.
- **Secondary:** A subtle indigo used sparingly for accents or secondary categorization.
- **Neutral:** A curated range of greyscale tones derived from the iOS system palette to ensure native-feel legibility.
- **Background:** The canvas uses a standard iOS grouped background color (#F2F2F7) to create a clear distinction between the screen surface and the white content containers.

## Typography

This design system utilizes **Hanken Grotesk** as a refined alternative to San Francisco, offering a similar professional geometry with slightly more contemporary character. 

- **Hierarchy:** Use `headline-lg` for view titles in large navigation bars. 
- **Body:** `body-lg` is the primary reading size, optimized for information density.
- **Labels:** Use `label-caps` for section headers in list views to maintain an organized, tabular feel.
- **Scaling:** On mobile, ensure large headlines transition to the `-mobile` variant to prevent excessive line wrapping while maintaining visual weight.

## Layout & Spacing

The layout philosophy follows a **Fixed Grid** approach common in native iOS development. 

- **Margins:** Standard side margins are set to 16px.
- **Containers:** Content is grouped into inset sections (the "Grouped List" style) which span the full width minus the margins.
- **Vertical Rhythm:** Elements are stacked using an 8px base grid. Use 16px between related components and 24px between distinct sections.
- **Mobile Adaption:** On smaller devices, gutters may reduce to 8px to maximize content area, but page margins remain fixed at 16px to ensure thumb-friendly interaction zones.

## Elevation & Depth

This design system avoids heavy drop shadows and floating cards. Instead, it utilizes **Tonal Layers** and **Low-Contrast Outlines** to define hierarchy.

- **Z-Axis:** Depth is communicated through color contrast. The background is `#F2F2F7`, and the primary interaction surface is `#FFFFFF`.
- **Separators:** Use 0.5px hair-lines for list items to maintain a crisp, technical look.
- **Active States:** Subtle 1-2% darkening of the surface color indicates a press state, rather than a shadow lift.
- **Modals:** Use standard iOS sheet presentations with a slight backdrop blur (Material Thin) to maintain context without cluttering the visual field.

## Shapes

The shape language is **Rounded**, adhering to the standard iOS 10pt-12pt corner radius logic. 

- **Primary Components:** Buttons and input fields use a 10px radius (`rounded-lg`).
- **Containers:** Large content blocks or list groupings use a 12px-16px radius (`rounded-xl`).
- **Interactive Small Elements:** Checkboxes and tags use a 6px radius to maintain a precise, professional silhouette.

## Components

### Buttons
- **Primary:** Solid `#0056D2` fill with white typography. No gradients.
- **Secondary:** Light blue tint background with primary blue text.
- **Tertiary:** Transparent background with primary blue text for low-priority actions.

### Input Fields
- White background, 10px corner radius.
- Use a subtle internal stroke (0.5px) in a light grey for definition.
- Placeholder text in `neutral` color.

### Lists
- Standard "Grouped" inset style. 
- White cells against the grey canvas. 
- Right-aligned chevrons for navigational items.

### Indicators
- **Progress:** Slim, 4px height bars in primary blue. Avoid heavy circular loaders where possible; prefer linear progress for a sense of "moving forward."
- **Empty States:** Use monochromatic icons and `body-sm` text. No large illustrations.

### Search Bar
- Integrated into the navigation bar. 
- High-contrast text with a subtle magnifying glass glyph. 
- Fully rounded ends (pill-shaped) to distinguish it from static input fields.