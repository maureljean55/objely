---
name: Reliability & Connection
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
  secondary: '#006e28'
  on-secondary: '#ffffff'
  secondary-container: '#6ffb85'
  on-secondary-container: '#00732a'
  tertiary: '#4c4aca'
  on-tertiary: '#ffffff'
  tertiary-container: '#6664e4'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a41'
  on-primary-fixed-variant: '#004493'
  secondary-fixed: '#72fe88'
  secondary-fixed-dim: '#53e16f'
  on-secondary-fixed: '#002107'
  on-secondary-fixed-variant: '#00531c'
  tertiary-fixed: '#e2dfff'
  tertiary-fixed-dim: '#c2c1ff'
  on-tertiary-fixed: '#0c006a'
  on-tertiary-fixed-variant: '#3631b4'
  background: '#faf9fe'
  on-background: '#1a1b1f'
  surface-variant: '#e3e2e7'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 34px
    fontWeight: '700'
    lineHeight: 41px
    letterSpacing: -0.4px
  headline-md:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.4px
  headline-sm:
    fontFamily: Inter
    fontSize: 17px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: -0.4px
  body-lg:
    fontFamily: Inter
    fontSize: 17px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: -0.4px
  body-md:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: -0.2px
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0px
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 13px
    letterSpacing: 0.1px
  headline-lg-mobile:
    fontFamily: Inter
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
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style
The design system is centered on trust, efficiency, and human reassurance. As a lost-and-found service, the UI must feel like a dependable utility while remaining approachable during potentially stressful moments.

The aesthetic follows a **Modern Corporate** style heavily influenced by iOS design patterns. It prioritizes clarity through generous whitespace, high-quality system typography, and subtle depth. The interface utilizes a "layered" approach where content sits on distinct surface planes to establish a clear information hierarchy.

## Colors
The palette is rooted in functional clarity. 
- **Primary Blue (#007AFF)** is used exclusively for primary actions, active states, and outgoing message bubbles to signal reliability.
- **Success Green (#34C759)** identifies online status, "found" item confirmations, and successful verification badges.
- **Surface Grays** utilize the iOS system palette, using `#F2F2F7` for the main background canvas and `#FFFFFF` for primary content cards and input areas. 
- **Text** follows a strict hierarchy: Deep Black for headings and Primary Gray (60% opacity equivalent) for secondary labels and metadata.

## Typography
The system uses **Inter** as a highly legible substitute for system fonts, ensuring a clean, technical, yet neutral tone. 

- **Headlines:** Use heavy weights (700) with tight letter spacing for a grounded, authoritative feel.
- **Body Text:** Optimized for readability in chat contexts; `body-lg` is the standard for message bubbles.
- **Labels:** Used for timestamps, "seen" receipts, and item categories. 
- **Mobile Scaling:** Large titles should scale down to 28px on mobile devices to maintain balance while preserving the bold "Large Title" iOS aesthetic.

## Layout & Spacing
This design system utilizes a **Fluid Grid** approach for mobile and a **Fixed Max-Width** for desktop views (max 800px for the messaging interface to keep line lengths readable).

- **The 8pt Grid:** All spacing and component heights should be increments of 8px (or 4px for fine-tuning).
- **Margins:** 16px safe-area margins for mobile. 
- **Chat Layout:** Message bubbles should have a 12px gutter between different senders and a 4px gutter between consecutive messages from the same sender.
- **Sticky Elements:** Headers and input toolbars must remain sticky, utilizing a `backdrop-filter: blur(20px)` and 80% opacity background to maintain context of scrolling content.

## Elevation & Depth
Depth is communicated through **Tonal Layering** and **Subtle Blurs** rather than heavy shadows.

- **Level 0 (Canvas):** `#F2F2F7` - The base background.
- **Level 1 (Surfaces):** `#FFFFFF` - Used for white cards in lists and the message input area.
- **Level 2 (Overlays):** Modals and sticky headers use a subtle `0px 4px 12px rgba(0,0,0,0.05)` shadow to suggest they are floating above the content.
- **Glassmorphism:** Navigation bars and toolbars must use the iOS-style frosted glass effect (background blur) to provide a sense of depth and material continuity.

## Shapes
The shape language is friendly and modern. 
- **Message Bubbles:** Use `rounded-lg` (16px) for the main body. When messages are grouped, the corners facing the previous/next message from the same sender should reduce to `rounded-sm` (4px) to create a visual "cluster."
- **Buttons & Inputs:** Standardized at `rounded-lg` (10px - 12px) for a professional look.
- **Cards:** List items for conversation history use `rounded-lg` when inset from the screen edges.

## Components
### Buttons
- **Primary:** Background `#007AFF`, white text, `semibold` weight. 
- **Secondary/Ghost:** Transparent background with `#007AFF` text for less critical actions.

### Message Bubbles
- **Outgoing:** Background `#007AFF`, Text `#FFFFFF`. Aligned right.
- **Incoming:** Background `#E9E9EB` (or Surface Gray), Text `#000000`. Aligned left.
- **Tail:** Small corner radius adjustment on the "outer" bottom corner to mimic the classic bubble tail.

### Lists (Conversation History)
- Sleek, full-width items with a 0.5px hair-line separator (`#C6C6C8`).
- Left-aligned circular avatars (48x48px).
- Right-aligned metadata (timestamp) in `label-md` gray.

### Input Fields
- Sticky footer input area with a "pill" shaped container for the text field.
- Icons for attachments (camera/gallery) use a thin-stroke glyph style in Primary Blue.

### Badges
- Small 8x8px circles for online status using Success Green.
- Numeric notification badges in Red (`#FF3B30`), positioned at the top-right of avatars.