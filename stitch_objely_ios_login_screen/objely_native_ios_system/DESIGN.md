---
name: Objely Native iOS System
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#434655'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#747686'
  outline-variant: '#c4c5d7'
  surface-tint: '#2151da'
  primary: '#0037b0'
  on-primary: '#ffffff'
  primary-container: '#1d4ed8'
  on-primary-container: '#cad3ff'
  inverse-primary: '#b7c4ff'
  secondary: '#0058be'
  on-secondary: '#ffffff'
  secondary-container: '#2170e4'
  on-secondary-container: '#fefcff'
  tertiary: '#5311bc'
  on-tertiary: '#ffffff'
  tertiary-container: '#6b38d4'
  on-tertiary-container: '#ddcdff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b7c4ff'
  on-primary-fixed: '#001551'
  on-primary-fixed-variant: '#0039b5'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#e9ddff'
  tertiary-fixed-dim: '#d0bcff'
  on-tertiary-fixed: '#23005c'
  on-tertiary-fixed-variant: '#5516be'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 34px
    fontWeight: '700'
    lineHeight: 41px
    letterSpacing: -0.022em
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.020em
  headline-md:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.018em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 25px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 30px
    letterSpacing: -0.018em
  title:
    fontFamily: Inter
    fontSize: 17px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: -0.016em
  body-lg:
    fontFamily: Inter
    fontSize: 17px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: -0.014em
  body-md:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: -0.010em
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: -0.005em
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: -0.005em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 13px
    letterSpacing: 0.005em
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  space-2xs: 0.125rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-base: 1rem
  space-lg: 1.25rem
  space-xl: 1.5rem
  space-2xl: 2rem
  space-3xl: 2.5rem
  space-4xl: 3rem
  screen-edge-mobile: 1rem
  gutter-mobile: 0.75rem
  container-padding-compact: 0.875rem
---

## Brand & Style

The design system delivers an ultra-clean, reassuring, and native iOS interface engineered for the urgent and emotionally delicate moments of losing, finding, and registering personal property. The core brand attributes are:

- **Absolute Trustworthiness & Integrity**: Every interaction evokes authority, institutional clarity, and verifiable security, eliminating anxiety during item recovery.
- **Pristine Clarity & Serenity**: Generous whitespace, razor-sharp typography, and calm chromatic balances prioritize legibility over decoration.
- **Native Precision**: Adheres strictly to iOS ergonomics, fluid touch targets, dynamic type balance, and system-level conventions.

### Design Movement
**Modern iOS Native with Tactile Precision & Ambient Atmospheric Gradients**:
- Crisp, low-contrast structural dividers (`#E2E8F0`).
- Atmospheric, ultra-subtle top-of-screen radial ambient bleeds (transitioning imperceptibly from Bleu Objely to Lavender at 4-6% opacity).
- Premium, elevated floating action panels and frosted system sheets.

## Colors

The color architecture is built around authoritative cobalt blues paired with gentle lavender accents and structured slate neutrals, providing instant visual confirmation of state, provenance, and verification.

### Palette Tokens & Application
- **Primary / Bleu Objely (`#1D4ED8`)**: Primary action buttons, verified badge fills, active tab navigation, high-priority state highlights.
- **Secondary / Bleu Éclat (`#3B82F6`, `#60A5FA`)**: Interactive links, multi-step progress paths, secondary toggle active fills, subtle hover/press glows.
- **Accent / Lavande Douce (`#8B5CF6`, `#A78BFA`)**: Distinctive item category markers, AI auto-tagging badges, subtle ambient background glow blends.
- **Neutral Dark / Bleu Nuit (`#0F172A`)**: Primary text, high-contrast headings, dark-mode foundational layers, primary system icons.
- **Neutral Muted / Ardoise Médiane (`#475569`, `#64748B`)**: Secondary descriptive copy, field labels, inactive indicators, timestamps.
- **Neutral Light / Blanc Givré & Brume (`#FFFFFF`, `#F8FAFC`, `#F1F5F9`)**: App canvas background, grouped list container fills, inset secondary wells.
- **Subtle Stroke / Ligne Délicate (`#E2E8F0`, `#CBD5E1`)**: Hairline borders (0.5pt/1px), input container perimeters, segmented control borders.
- **Semantic Trust & Success (`#059669`, `#10B981`)**: "Found & Reunited" resolution status, encrypted data badges, cryptographic QR tags.
- **Semantic Warning & Hazard (`#D97706`, `#EF4444`)**: Stolen/Critical item alert status, urgent reporting timers, destructive sheet actions.

### Background Atmospheric Treatment
The root viewport features an imperceptible linear-to-radial bleed:
`background: linear-gradient(180deg, rgba(29, 78, 216, 0.04) 0%, rgba(139, 92, 246, 0.02) 20%, #FFFFFF 40%)`.

## Typography

The typography uses Inter to provide an ultra-clean, neutral, and precise appearance in line with modern iOS native UI guidelines.

### Hierarchical Usage Rules
- **Large Titles (`display-lg`)**: Reserved exclusively for top-level iOS collapsing navigation bars ("Mes Objets", "Déclarer une Perte").
- **Titles & List Headers (`title`, `headline-sm`)**: Inset grouped section headers and item title cards. Always paired with negative letter-spacing to reproduce iOS tracking curves.
- **Body (`body-lg`, `body-md`)**: Crisp, highly readable item descriptions, location notes, and security instructions.
- **Labels & Microcopy (`label-md`, `label-sm`)**: Status chips, badge overlays, and form input labels. Form labels use uppercase tracking `+0.04em` when displayed in grouped section header styles.

## Layout & Spacing

The layout model is mobile-first, prioritizing handheld reachability, consistent thumb zones, and iOS Safe Area constraints.

### Grid & Ergonomics
- **Screen Margins**: Uniform 16px (`1rem`) lateral padding across all phone viewports; 24px (`1.5rem`) on iPad split-view or tablet screens.
- **Vertical Rhythm**: Built on a modular 4pt/8pt grid. Field-to-field gaps are consistently 12px or 16px; grouped section stacks maintain 24px separators.
- **Touch Target Standard**: All interactive nodes strictly adhere to the Apple Human Interface Guidelines minimum target bounding box of 44x44 points.
- **Bottom Sheet Architecture**: Modal declaration flows dock to the bottom viewport with an 8px top pull indicator, 16px bottom padding above the Home Indicator bar.

## Elevation & Depth

Visual hierarchy uses clean tonal surfaces, iOS-style frosted blurs, hairline borders, and subtle, diffuse shadows.

### Elevation Hierarchy
1. **Level 0 (Base Canvas)**: Pure `#FFFFFF` blending subtly into top ambient gradient. Completely flat.
2. **Level 1 (Grouped Cards & Inset Lists)**: Surface color `#FFFFFF` or `#F8FAFC`, enclosed by a 1px hairline border in `#E2E8F0`. Shadow: `0 1px 3px rgba(15, 23, 42, 0.04), 0 1px 2px rgba(15, 23, 42, 0.02)`.
3. **Level 2 (Interactive Cards & Floating Modals)**: Surface `#FFFFFF` with 1px border `#E2E8F0`. Shadow: `0 8px 24px -4px rgba(15, 23, 42, 0.06), 0 4px 12px -2px rgba(15, 23, 42, 0.03)`.
4. **Level 3 (Floating Action Dock & Bottom Navigation)**: Frosted glass material. `background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(20px) saturate(180%);` with a 0.5px top border `#E2E8F0`. Shadow: `0 -4px 20px rgba(15, 23, 42, 0.04)`.
5. **Level 4 (High-Priority Primary Actions)**: Bleu Objely buttons receive a focused drop shadow: `0 6px 16px rgba(29, 78, 216, 0.25)`.

## Shapes

The shape vocabulary uses standard iOS squircle styling (`continuous` corner smoothing) to maintain a refined, modern feel.

### Corner Radius Mapping
- **Primary Buttons & Large Action Bars**: Continuous 14px–16px (`rounded-xl` / `1rem`), providing a tactile, pill-adjacent feel without distorting into full semicircles.
- **Form Input Containers**: 12px–14px (`rounded-xl`), matching button corner geometry for structural cohesion.
- **Cards & Floating Panels**: 16px–20px (`rounded-2xl`), framing image previews, map viewports, and item metadata.
- **Pills, Badges & Chips**: Full pill radius (`9999px`) for status chips (e.g., "Retrouvé", "En attente") and categorization tags.
- **System Segmented Controls**: 10px rounded background housing nested 8px rounded selection slides.

## Components

### Buttons
- **Primary Action (Bleu Objely)**: Background `#1D4ED8`, text `#FFFFFF`, font weight `600`, height `52px`, `rounded-xl`. Pressed state scales down smoothly to `scale(0.98)` with background `#1E40AF`.
- **Secondary Action**: Background `#F1F5F9`, text `#0F172A`, border `1px solid #E2E8F0`, font weight `600`, height `52px`, `rounded-xl`.
- **Social Sign-In (Apple & Google)**:
  - *Apple*: Solid `#000000` fill, pure white crisp Apple silhouette, white text `Continuer avec Apple`, height `50px`, `rounded-xl`.
  - *Google*: White surface `#FFFFFF`, border `1px solid #E2E8F0`, official four-color Google "G" SVG icon, text `#0F172A`, height `50px`, `rounded-xl`.
- **Ghost/Tertiary Action**: Transparent fill, text `#1D4ED8`, minimum 44pt tap region.

### Input Fields & Modern Form Containers
- Full-width iOS-style containers with height `54px`.
- Background `#F8FAFC`, transition to `#FFFFFF` on focus.
- Border `1px solid #E2E8F0`, transitioning cleanly to `1.5px solid #1D4ED8` with a subtle focus ring `0 0 0 4px rgba(29, 78, 216, 0.12)`.
- Trailing icons for clearing input, status validation checkmarks, or scanning actions (e.g., serial number OCR camera trigger).

### Status Chips & Category Badges
- Height `28px`, padding `0 12px`, `rounded-full`.
- **Found / Reunited**: Background `#ECFDF5`, text `#059669`, border `1px solid #A7F3D0`. Includes a 6px solid circular green pulse dot.
- **Lost / Searching**: Background `#EFF6FF`, text `#1D4ED8`, border `1px solid #BFDBFE`.
- **AI Category Chip (e.g., "Électronique", "Bagagerie")**: Background `rgba(139, 92, 246, 0.08)`, text `#8B5CF6`, border `1px solid rgba(167, 139, 250, 0.3)`.

### Cards (Lost/Found Item Card)
- Surface `#FFFFFF`, border `1px solid #E2E8F0`, radius `16px`.
- Aspect-ratio thumbnail image with an inset border radius of `12px`.
- Integrated micro-badges for date, approximate geo-radius, and verification status.

### Security Badges & Trust Accents
- Compact verification banner: `#F8FAFC` background, hairline border `#E2E8F0`, displaying a secure lock glyph or national database sync indicator in `#059669` alongside 11px micro-copy.

### Checkboxes & Radios
- Radios: 22px outer circle, 1.5px border `#CBD5E1`. Selected: `#1D4ED8` fill with 8px solid white inner circle.
- Checkboxes: 22px rounded square (`6px` radius), selected state in `#1D4ED8` displaying a sharp white tick mark.