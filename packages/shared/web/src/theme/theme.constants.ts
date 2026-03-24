import { ecommerceThemeModes } from "../design-system/tokens";

export const THEME_STORAGE_KEY = "solar-esportes-theme";
export const THEME_COOKIE_NAME = "solar-esportes-theme";
export const DEFAULT_THEME = "light" as const;

export const themeModes = ecommerceThemeModes;

export type ThemeMode = (typeof themeModes)[number];

export const isThemeMode = (value: string | null | undefined): value is ThemeMode =>
  value === "dark" || value === "light";

export const getSystemTheme = (): ThemeMode => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return DEFAULT_THEME;
  }

  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
};

export const getCookieThemeValue = (cookieValue: string | null | undefined): ThemeMode | null => {
  return isThemeMode(cookieValue) ? cookieValue : null;
};
