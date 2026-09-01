---
name: Objely Brand Identity
colors:
  surface: '#f9f9fe'
  surface-dim: '#d9dade'
  surface-bright: '#f9f9fe'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f8'
  surface-container: '#ededf2'
  surface-container-high: '#e8e8ed'
  surface-container-highest: '#e2e2e7'
  on-surface: '#1a1c1f'
  on-surface-variant: '#414755'
  inverse-surface: '#2e3034'
  inverse-on-surface: '#f0f0f5'
  outline: '#717786'
  outline-variant: '#c1c6d7'
  surface-tint: '#005bc1'
  primary: '#0058bc'
  on-primary: '#ffffff'
  primary-container: '#0070eb'
  on-primary-container: '#fefcff'
  inverse-primary: '#adc6ff'
  secondary: '#5952af'
  on-secondary: '#ffffff'
  secondary-container: '#a19afd'
  on-secondary-container: '#352c8a'
  tertiary: '#455d80'
  on-tertiary: '#ffffff'
  tertiary-container: '#5d769a'
  on-tertiary-container: '#fefcff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a41'
  on-primary-fixed-variant: '#004493'
  secondary-fixed: '#e3dfff'
  secondary-fixed-dim: '#c5c0ff'
  on-secondary-fixed: '#140067'
  on-secondary-fixed-variant: '#413996'
  tertiary-fixed: '#d4e3ff'
  tertiary-fixed-dim: '#afc8f0'
  on-tertiary-fixed: '#001c3a'
  on-tertiary-fixed-variant: '#2f486a'
  background: '#f9f9fe'
  on-background: '#1a1c1f'
  surface-variant: '#e2e2e7'
typography:
  display:
    fontFamily: Plus Jakarta Sans
    fontSize: 34px
    fontWeight: '700'
    lineHeight: 41px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 17px
    fontWeight: '600'
    lineHeight: 22px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 17px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 30px
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  container-margin: 20px
  gutter: 16px
---

## Brand & Style

The design system is centered on the concept of "reconnection." It targets a wide demographic of mobile users who need a reliable, high-end environment during the stressful experience of losing or finding items. 

The aesthetic is **Premium iOS-Inspired**, blending the precision of Apple’s human interface guidelines with a softer, more approachable personality. This is achieved through a **Minimalist** foundation augmented by **Glassmorphism** and **Tactile** depth. The UI should evoke a sense of calm, order, and optimism. High-quality whitespace is used to reduce cognitive load, while the interlocking visual motif of the logo is echoed in the overlapping card layouts and smooth transitions.

## Colors

The color palette is anchored in utility and emotional reassurance. 

*   **Action Blue (#007AFF):** Used for primary calls to action, active states, and links. It signals interactivity and progress.
*   **Found Lavender (#A29BFE):** Specifically reserved for "Found" object flows and secondary brand moments, providing a soft contrast to the primary blue.
*   **Deep Navy (#001F3F):** The foundational color for high-hierarchy typography and headers, ensuring legibility and a professional weight.
*   **Success Green (#34C759):** Utilized for confirmation screens, "Item Returned" badges, and positive status indicators.
*   **System Neutrals:** A range of soft greys and off-whites (backgrounds at #F2F2F7, card surfaces at #FFFFFF) maintain the clean, iOS-like aesthetic.

## Typography

The design system utilizes **Plus Jakarta Sans** for its friendly, rounded geometry that closely mimics the warmth of SF Pro Rounded. 

Headlines use tighter letter spacing and heavier weights to establish a clear hierarchy against the generous whitespace. Body text is optimized for legibility with comfortable line heights. For mobile views, display sizes scale down to ensure content remains above the fold. All labels should be clear and concise, using the medium weight for better visibility against colorful backgrounds.

## Layout & Spacing

The layout philosophy follows a **Fluid Grid** model with high internal padding to maintain the "premium" feel. 

*   **Mobile:** 4-column grid with 20px side margins. 
*   **Tablet/Desktop:** 12-column grid with a maximum content width of 1140px, centered.
*   **Spacing Rhythm:** Based on an 8px baseline. Use `lg` (24px) for most component spacing and `xl` (32px) for section vertical separation to ensure a breathable, "airy" interface.

## Elevation & Depth

Hierarchy is communicated through **Ambient Shadows** and **Tonal Layers**.

*   **Base Layer:** Solid #F2F2F7 background.
*   **Surface Layer:** White (#FFFFFF) cards with a subtle 1px inner stroke in #000000 at 5% opacity.
*   **Elevated State:** Shadows should be highly diffused. Use a "Soft Bloom" effect: `0px 10px 30px rgba(0, 31, 63, 0.08)`.
*   **Interactive Depth:** Buttons use a very subtle linear gradient (top to bottom, 5% lighter to 5% darker) to feel physically pressable.
*   **Modals:** Utilize Backdrop Blurs (System Blur) with a 70% opacity white overlay to create a glassmorphic effect that keeps the background context visible but secondary.

## Shapes

The shape language is defined by extreme roundedness to convey friendliness and safety. 

*   **Standard Components:** Buttons and Input Fields use a 16px radius.
*   **Container Cards:** Use a significant 24px to 32px corner radius (defined as `rounded-xl` and `rounded-2xl` in implementation).
*   **Selection States:** Chips and Small Badges are fully pill-shaped.
*   **Image Containers:** Always follow the radius of their parent card to maintain concentricity.

## Components

### Buttons
*   **Primary:** Large (min-height: 56px), background #007AFF, white text, 16px radius.
*   **Secondary:** White background, 1px #007AFF border, blue text.
*   **Ghost:** No background, blue text, used for less urgent actions like "Cancel."

### Cards
*   **Item Card:** 24px corner radius, soft bloom shadow, 16px internal padding. Image at the top with matching top-radius. Includes a "Status Badge" in the top right corner.

### Input Fields
*   **Style:** Filled style with #F2F2F7 background in resting state. Transitions to a 1px #007AFF border on focus. 16px corner radius. Labels sit above the field in `label-md` style.

### Tab Bar
*   **Design:** Floating or docked with a heavy backdrop blur. Icons use #001F3F (Active: #007AFF). 32px top corner radius.

### Chips
*   **Categories:** Pill-shaped, light lavender (#A29BFE at 15% opacity) with #A29BFE text. 

### Progress Indicators
*   **Lost/Found Steps:** Thin 4px bars with rounded ends. Active steps use a gradient from #007AFF to #A29BFE.