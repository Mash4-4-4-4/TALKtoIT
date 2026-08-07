import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getTokens, type ThemeMode, type Tokens } from "../theme/tokens";

type AppThemeContextType = {
  mode: ThemeMode;
  toggleTheme: () => void;
  tokens: Tokens;
};

const STORAGE_KEY = "talktoit-theme";

const AppThemeContext = createContext<AppThemeContextType | null>(null);

const getInitialMode = (): ThemeMode => {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  // fall back to the user's OS preference on first visit
  if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) return "dark";
  return "light";
};

export const AppThemeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<ThemeMode>(getInitialMode);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, mode);
    document.documentElement.setAttribute("data-theme", mode);
    document.body.style.backgroundColor = getTokens(mode).PAGE_BG;
  }, [mode]);

  const toggleTheme = () => setMode((prev) => (prev === "light" ? "dark" : "light"));

  const value = useMemo(() => ({ mode, toggleTheme, tokens: getTokens(mode) }), [mode]);

  return <AppThemeContext.Provider value={value}>{children}</AppThemeContext.Provider>;
};

export const useAppTheme = (): AppThemeContextType => {
  const ctx = useContext(AppThemeContext);
  if (!ctx) throw new Error("useAppTheme must be used within an AppThemeProvider");
  return ctx;
};
