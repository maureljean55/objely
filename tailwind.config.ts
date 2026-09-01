import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";
import containerQueries from "@tailwindcss/container-queries";

// Neutral surface/text tokens are backed by CSS variables (see globals.css)
// so a `.dark` class on <html> can re-theme the whole app at runtime.
// Brand accent colors stay static hex — they read fine on both themes.
// Tailwind's Config type doesn't model function color values, even though
// Tailwind itself supports (and needs) them here — cast to satisfy it.
function withOpacity(variable: string): string {
  return ((({ opacityValue }: { opacityValue?: string }) =>
    opacityValue === undefined ? `rgb(var(${variable}))` : `rgb(var(${variable}) / ${opacityValue})`) as unknown) as string;
}

// Design tokens ported from `design objely/objely_brand_identity/DESIGN.md`
const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        surface: withOpacity("--color-surface"),
        "surface-dim": withOpacity("--color-surface-dim"),
        "surface-bright": withOpacity("--color-surface-bright"),
        "surface-container-lowest": withOpacity("--color-surface-container-lowest"),
        "surface-container-low": withOpacity("--color-surface-container-low"),
        "surface-container": withOpacity("--color-surface-container"),
        "surface-container-high": withOpacity("--color-surface-container-high"),
        "surface-container-highest": withOpacity("--color-surface-container-highest"),
        "on-surface": withOpacity("--color-on-surface"),
        "on-surface-variant": withOpacity("--color-on-surface-variant"),
        "inverse-surface": withOpacity("--color-inverse-surface"),
        "inverse-on-surface": withOpacity("--color-inverse-on-surface"),
        outline: withOpacity("--color-outline"),
        "outline-variant": withOpacity("--color-outline-variant"),
        "surface-tint": "#005bc1",
        primary: "#0058bc",
        "on-primary": "#ffffff",
        "primary-container": "#0070eb",
        "on-primary-container": "#fefcff",
        "inverse-primary": "#adc6ff",
        secondary: "#5952af",
        "on-secondary": "#ffffff",
        "secondary-container": "#a19afd",
        "on-secondary-container": "#352c8a",
        tertiary: "#455d80",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#5d769a",
        "on-tertiary-container": "#fefcff",
        error: "#ba1a1a",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",
        "primary-fixed": "#d8e2ff",
        "primary-fixed-dim": "#adc6ff",
        "on-primary-fixed": "#001a41",
        "on-primary-fixed-variant": "#004493",
        "secondary-fixed": "#e3dfff",
        "secondary-fixed-dim": "#c5c0ff",
        "on-secondary-fixed": "#140067",
        "on-secondary-fixed-variant": "#413996",
        "tertiary-fixed": "#d4e3ff",
        "tertiary-fixed-dim": "#afc8f0",
        "on-tertiary-fixed": "#001c3a",
        "on-tertiary-fixed-variant": "#2f486a",
        background: withOpacity("--color-background"),
        "on-background": withOpacity("--color-on-background"),
        "surface-variant": withOpacity("--color-surface-variant"),
      },
      borderRadius: {
        sm: "0.5rem",
        DEFAULT: "1rem",
        md: "1.5rem",
        lg: "2rem",
        xl: "3rem",
        full: "9999px",
      },
      spacing: {
        base: "8px",
        xs: "4px",
        sm: "12px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        "container-margin": "20px",
        gutter: "16px",
        "safe-bottom": "env(safe-area-inset-bottom, 20px)",
      },
      fontFamily: {
        display: ["Plus Jakarta Sans", "sans-serif"],
        "headline-lg": ["Plus Jakarta Sans", "sans-serif"],
        "headline-md": ["Plus Jakarta Sans", "sans-serif"],
        "headline-sm": ["Plus Jakarta Sans", "sans-serif"],
        "headline-lg-mobile": ["Plus Jakarta Sans", "sans-serif"],
        "body-lg": ["Plus Jakarta Sans", "sans-serif"],
        "body-md": ["Plus Jakarta Sans", "sans-serif"],
        "label-md": ["Plus Jakarta Sans", "sans-serif"],
      },
      fontSize: {
        display: ["34px", { lineHeight: "41px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-lg": ["28px", { lineHeight: "34px", letterSpacing: "-0.01em", fontWeight: "700" }],
        "headline-md": ["22px", { lineHeight: "28px", fontWeight: "600" }],
        "headline-sm": ["17px", { lineHeight: "22px", fontWeight: "600" }],
        "headline-lg-mobile": ["24px", { lineHeight: "30px", fontWeight: "700" }],
        "body-lg": ["17px", { lineHeight: "24px", fontWeight: "400" }],
        "body-md": ["15px", { lineHeight: "20px", fontWeight: "400" }],
        "label-md": ["13px", { lineHeight: "18px", letterSpacing: "0.05em", fontWeight: "500" }],
      },
      boxShadow: {
        "soft-bloom": "0px 10px 30px rgba(0, 31, 63, 0.08)",
        nav: "0px -10px 30px rgba(0, 31, 63, 0.08)",
      },
      keyframes: {
        float: {
          "0%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-15px)" },
          "100%": { transform: "translateY(0px)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        fadeIn: "fadeIn 0.5s ease-out",
        slideUp: "slideUp 0.5s ease-out both",
      },
    },
  },
  plugins: [forms, containerQueries],
};

export default config;
