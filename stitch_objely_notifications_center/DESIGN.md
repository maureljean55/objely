---
name: Atmospheric Precision
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
  on-surface-variant: '#414755'
  inverse-surface: '#2f3034'
  inverse-on-surface: '#f1f0f5'
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
  tertiary: '#8a2bb9'
  on-tertiary: '#ffffff'
  tertiary-container: '#a649d5'
  on-tertiary-container: '#fffbff'
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
  tertiary-fixed: '#f6d9ff'
  tertiary-fixed-dim: '#e8b3ff'
  on-tertiary-fixed: '#310048'
  on-tertiary-fixed-variant: '#7201a2'
  background: '#faf9fe'
  on-background: '#1a1b1f'
  surface-variant: '#e3e2e7'
typography:
  display:
    fontFamily: Inter
    fontSize: 34px
    fontWeight: '700'
    lineHeight: 41px
    letterSpacing: -0.02em
  headline:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
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
    letterSpacing: -0.01em
  body-sm:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  caption:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  margin-main: 16px
  gutter-grid: 12px
  stack-sm: 4px
  stack-md: 8px
  stack-lg: 16px
  stack-xl: 24px
  section-gap: 32px
---

## Brand & Style
The design system focuses on a high-fidelity, professional iOS-inspired aesthetic. It prioritizes clarity, performance, and a "quiet" interface that recedes to let user content take center stage. The style is **Modern Minimalist** with a focus on precision: it avoids heavy drop shadows and boxy containers in favor of structural whitespace and subtle tonal shifts. 

The emotional response should be one of competence and fluidity. Every transition and layout decision mimics the native feeling of a premium utility app, utilizing a "Glassmorphism Lite" approach for headers and navigation elements to maintain context while scrolling.

## Colors
The palette is rooted in the high-contrast accessibility of professional mobile environments. 

- **Primary:** An energetic, reliable blue used for actionable elements, selection states, and key branding.
- **Surface & Background:** The foundation uses a "System Gray 6" (#F2F2F7) for the main background to provide a soft, lavender-tinted warmth. Interactive content sits on pure white (#FFFFFF) surfaces to create a clear "layered" hierarchy without needing borders.
- **Accents:** Secondary and Tertiary colors (Indigo and Purple) are reserved for data visualization or status indicators to maintain a professional, tech-forward feel.

## Typography
This design system utilizes **Inter** for its systematic, utilitarian nature that closely mirrors the proportions of SF Pro. 

- **Scale:** Uses a strict hierarchy where the `Display` size is reserved for Large Title navigation bars. 
- **Readability:** Body text is set at 17px, the standard for mobile legibility. 
- **Contrast:** Employs medium and semi-bold weights for hierarchy rather than dramatic size changes.
- **Letter Spacing:** Larger titles use slight negative tracking (-0.01em to -0.02em) to feel tighter and more premium on high-density mobile screens.

## Layout & Spacing
The layout follows a **Fluid Grid** model optimized for mobile constraints. 

- **Margins:** A consistent 16px horizontal margin is applied to all screens.
- **Rhythm:** An 8pt grid system governs all vertical spacing.
- **Sectioning:** Content is grouped into logical blocks using whitespace rather than containers. Large gaps (32px) separate distinct functional areas. 
- **Alignment:** All text elements align to the leading edge of the margin. Icons are center-aligned within 24px or 44px hit targets to ensure accessibility (WCAG).

## Elevation & Depth
Depth is conveyed through **Tonal Layering** and **Background Blurs** rather than traditional drop shadows.

- **Level 0 (Background):** #F2F2F7 lavender-gray.
- **Level 1 (Surface):** Pure White (#FFFFFF). This is used for list items, input fields, and inset groupings.
- **Level 2 (Navigation):** Background-blurred surfaces (Translucent White at 80% opacity) for Tab Bars and Navigation Bars, creating a sense of height and context as content scrolls beneath.
- **Separators:** 0.5pt lines in a light gray (#C6C6C8) are used sparingly to define boundaries in dense lists.

## Shapes
The shape language is **Rounded** to feel modern and friendly while maintaining a professional structure.

- **Standard Elements:** Buttons and input fields use a 10px-12px (rounded-lg) corner radius.
- **Grouping Elements:** Inset groups (like those found in iOS Settings) use a 12px radius.
- **Iconography:** Uses the Apple SF Symbols style—rounded terminals and consistent stroke weights (2pt) to match the typography.

## Components
- **Buttons:** Primary buttons are high-saturation (Primary Blue) with white text. Secondary buttons are "ghost" style with Primary Blue text on a light tinted background.
- **Lists:** Use the "Inset Grouped" style. Items are white rows with 16px padding, separated by 0.5pt dividers that don't reach the edge of the screen (indented by 16px).
- **Inputs:** Clean, borderless white fields when on the gray background, or subtly outlined with #E5E5EA when on a white background. No floating labels; use clear placeholder text and persistent top-aligned labels in `label-caps`.
- **Chips:** Highly rounded (Pill-shaped) for status indicators, using low-saturation background tints with high-saturation text.
- **Cards:** Avoid heavy shadows. Use a subtle 1px border or a simple white surface against the lavender background to define the card area.
- **Tab Bar:** Clear, minimalist icons with "Primary Blue" for the active state and "Neutral Gray" for inactive. No top border; use a background blur (material) effect.