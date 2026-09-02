---
name: Objely Native
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
  tertiary: '#9e3d00'
  on-tertiary: '#ffffff'
  tertiary-container: '#c64f00'
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
  tertiary-fixed: '#ffdbcc'
  tertiary-fixed-dim: '#ffb595'
  on-tertiary-fixed: '#351000'
  on-tertiary-fixed-variant: '#7c2e00'
  background: '#faf9fe'
  on-background: '#1a1b1f'
  surface-variant: '#e3e2e7'
typography:
  large-title:
    fontFamily: Inter
    fontSize: 34px
    fontWeight: '700'
    lineHeight: 41px
    letterSpacing: 0.37px
  title-1:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: 0.36px
  title-2:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: 0.35px
  headline:
    fontFamily: Inter
    fontSize: 17px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: -0.41px
  body:
    fontFamily: Inter
    fontSize: 17px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: -0.41px
  subheadline:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: -0.24px
  footnote:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: -0.08px
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  margin-main: 16px
  gutter-list: 20px
  stack-gap-sm: 8px
  stack-gap-md: 16px
  safe-area-bottom: 34px
---

## Brand & Style

The design system is engineered to feel like an integral part of the iOS ecosystem. It prioritizes a **Modern Corporate** aesthetic that mirrors Apple’s Human Interface Guidelines (HIG). The brand personality is professional, secure, and invisible—allowing the user's data to take center stage.

The style leverages a **Minimalist** approach with high-fidelity execution. It relies on generous whitespace, precise alignment, and standard iOS patterns to evoke a sense of reliability and platform-native performance. The emotional response should be one of "system-level trust," where the app feels as stable and responsive as a first-party utility.

## Colors

The palette is rooted in the high-vibrancy spectrum characteristic of iOS. 

- **Primary (Objely Blue):** Used for actionable items, active states, and focus indicators.
- **Backgrounds:** A tiered system using Pure White (`#FFFFFF`) for primary content areas and System Gray 6 (`#F2F2F7`) for grouped list backgrounds and inset surfaces.
- **Labels:** Follows semantic layering:
    - **Label:** `#000000` (Primary text)
    - **Secondary Label:** `#3C3C43` at 60% opacity (Descriptions and subtitles)
    - **Tertiary Label:** `#3C3C43` at 30% opacity (Placeholder text)
- **Dividers:** Use a subtle `#C6C6C8` or 0.5px hair-line stroke to maintain the clean, "retina" look.

## Typography

This design system utilizes **Inter** as a highly-compatible web alternative to San Francisco, ensuring a clean, systematic feel. 

- **Scale:** Adheres strictly to the iOS Dynamic Type scale.
- **Weight:** Use "Bold" or "Semibold" for navigation titles and primary CTAs. Use "Regular" for body copy and list labels.
- **Letter Spacing:** Negative tracking is applied to body and headline levels to replicate the "tight" professional feel of native system fonts.
- **Alignment:** Titles should be "Large" (34px) in navigation bars, collapsing to "Headline" (17px) upon scroll.

## Layout & Spacing

The layout follows a **Fluid Grid** model centered on standard mobile margins.

- **Margins:** A consistent 16px horizontal margin is used for all screen-edge content.
- **Rhythm:** Spacing follows an 4px/8px incremental system. 
- **List Patterns:** Inset Grouped lists (Settings-style) should have a 16px margin from the screen edge, with internal content padded at 16px.
- **Safe Areas:** Design must respect the Notch/Dynamic Island top area and the Home Indicator bottom area (34px).
- **Adaptivity:** On iPad/Desktop, the content width should be capped at 640px for readability or transition to a multi-column sidebar layout.

## Elevation & Depth

Elevation is primarily communicated through **Tonal Layers** rather than heavy shadows.

- **Z-Axis:** Level 0 is the `secondary_background` (`#F2F2F7`). Level 1 (Cards/List Rows) is the `background` (`#FFFFFF`).
- **Modals:** Use the "Page Sheet" style where the new view slides up and partially covers the previous view, which scales down slightly in the background.
- **Shadows:** Only used for high-impact floating elements (e.g., a floating action button). Shadows should be extremely soft: `0px 4px 12px rgba(0,0,0,0.08)`.
- **Blur:** Use `SystemUltraThinMaterial` (Backdrop Filter) for navigation bars and tab bars to allow content to bleed through elegantly during scroll.

## Shapes

The design system adopts the **Rounded** (Level 2) logic to match Apple's "continuous curve" (squircle) aesthetic.

- **Standard Buttons:** 10px to 12px corner radius.
- **Inset Grouped Cells:** 10px corner radius.
- **Large Cards:** 16px to 20px corner radius.
- **Input Fields:** 10px corner radius.
- **Toggles/Pills:** Fully rounded (capsule).

## Components

### Buttons
- **Primary:** Solid Objely Blue background with White text. Rounded 10px. 
- **Secondary:** Blue text on a subtle blue-tinted background (5% opacity) or transparent background.
- **Size:** Minimum hit target of 44x44pt.

### List Rows (Settings Pattern)
- High 44pt-60pt cells. 
- Chevron-right icon (`SF Symbol: chevron.right`) for navigable rows. 
- Leading icons should be housed in a 28x28pt rounded-rect container with a solid color background.

### Inputs & Form Elements
- **Text Fields:** Clean underline or subtle bordered box. Use the `Secondary Label` color for placeholders.
- **Toggles:** Native iOS `UISwitch` style—green (`#34C759`) when active.
- **Segmented Control:** Used for switching views (e.g., "Day / Month / Year") with a subtle sliding physical background.

### Overlays
- **Action Sheets:** Use for destructive actions or multiple choices.
- **Toasts:** Center-screen "HUD" style (small, translucent black square with white icon) for status confirmations like "Saved."