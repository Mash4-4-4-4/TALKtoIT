// ── centralized design tokens ── minimalist dark-card aesthetic ─────────────
// Every page pulls these from useAppTheme() instead of hardcoding hex values,
// so the whole site can flip between light and dark mode from one place.

export type ThemeMode = "light" | "dark";

export interface Tokens {
  PAGE_BG: string;        // page canvas
  CARD: string;           // near-black card surface (sidebars, headers, composer)
  CARD_ALT: string;       // nested surface within a dark card
  SURFACE: string;        // "light" card surface (feature cards, message bubbles)
  BORDER_SOFT: string;    // hairline on the page canvas
  BORDER_DARK: string;    // hairline on a dark card
  TEXT_INK: string;       // primary text on the page canvas / light surfaces
  TEXT_MUTED: string;     // secondary text on the page canvas / light surfaces
  TEXT_PAPER: string;     // primary text on dark cards
  TEXT_PAPER_DIM: string; // secondary text on dark cards
  ACCENT: string;         // quiet sage — status/success only
  ACCENT_WARN: string;    // amber — processing/attention
  ACCENT_DANGER: string;  // muted red — destructive/error
  SURFACE_ALT: string;    // assistant bubble / input field fill — sits on top of SURFACE, adapts per mode
  SURFACE_MUTED: string;  // disabled buttons, muted pills — adapts per mode
  ON_ACCENT: string;      // text color for content placed on a fixed light chip/button (e.g. TEXT_PAPER bg) — always dark, never adapts
  SANS: string;
}

const SANS = "'Inter', -apple-system, 'Segoe UI', sans-serif";

export const lightTokens: Tokens = {
  PAGE_BG: "#F3F1EC",
  CARD: "#18181A",
  CARD_ALT: "#222224",
  SURFACE: "#FFFFFF",
  BORDER_SOFT: "#E8E5DC",
  BORDER_DARK: "#333335",
  TEXT_INK: "#17171A",
  TEXT_MUTED: "#8B8A84",
  TEXT_PAPER: "#F6F5F1",
  TEXT_PAPER_DIM: "#9C9B9E",
  ACCENT: "#7C9473",
  ACCENT_WARN: "#C98A4B",
  ACCENT_DANGER: "#B95C50",
  SURFACE_ALT: "#F5F4EF",
  SURFACE_MUTED: "#EDEBE3",
  ON_ACCENT: "#0E0F0E",
  SANS,
};

export const darkTokens: Tokens = {
  PAGE_BG: "#121214",
  CARD: "#1D1D20",
  CARD_ALT: "#28282B",
  SURFACE: "#1A1A1C",
  BORDER_SOFT: "#2C2C2F",
  BORDER_DARK: "#3A3A3D",
  TEXT_INK: "#EDEBE5",
  TEXT_MUTED: "#9C9A93",
  TEXT_PAPER: "#F6F5F1",
  TEXT_PAPER_DIM: "#9C9B9E",
  ACCENT: "#93B187",
  ACCENT_WARN: "#D89A5C",
  ACCENT_DANGER: "#D2776A",
  SURFACE_ALT: "#242427",
  SURFACE_MUTED: "#2B2B2F",
  ON_ACCENT: "#0E0F0E",
  SANS,
};

export const getTokens = (mode: ThemeMode): Tokens =>
  mode === "dark" ? darkTokens : lightTokens;
