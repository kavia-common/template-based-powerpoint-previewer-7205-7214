import React, { createContext, useContext, useMemo } from "react";

/**
 * Ocean Professional theme tokens.
 * Kept as JS (not TS) to match the current CRA JS template.
 */
const OCEAN_THEME = {
  name: "Ocean Professional",
  colors: {
    primary: "#2563EB",
    secondary: "#F59E0B",
    success: "#F59E0B",
    error: "#EF4444",
    background: "#f9fafb",
    surface: "#ffffff",
    text: "#111827",
  },
};

const ThemeContext = createContext({
  theme: OCEAN_THEME,
});

// PUBLIC_INTERFACE
export function ThemeProvider({ children }) {
  /** Provides the Ocean Professional theme tokens via context. */
  const value = useMemo(() => ({ theme: OCEAN_THEME }), []);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// PUBLIC_INTERFACE
export function useTheme() {
  /** Returns the current theme tokens. */
  return useContext(ThemeContext);
}
