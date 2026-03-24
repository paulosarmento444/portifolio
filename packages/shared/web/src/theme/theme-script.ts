import { DEFAULT_THEME, THEME_COOKIE_NAME, THEME_STORAGE_KEY, type ThemeMode } from "./theme.constants";

const applyThemeScript = `
  (function () {
    var root = document.documentElement;
    var storageKey = "__THEME_STORAGE_KEY__";
    var cookieName = "__THEME_COOKIE_NAME__";
    var fallbackTheme = "__DEFAULT_THEME__";

    var isTheme = function (value) {
      return value === "dark" || value === "light";
    };

    var readCookieTheme = function () {
      var cookieMatch = document.cookie.match(new RegExp("(?:^|; )" + cookieName + "=([^;]+)"));
      if (!cookieMatch) {
        return null;
      }

      var value = decodeURIComponent(cookieMatch[1]);
      return isTheme(value) ? value : null;
    };

    var readStoredTheme = function () {
      try {
        var stored = window.localStorage.getItem(storageKey);
        return isTheme(stored) ? stored : null;
      } catch (error) {
        return null;
      }
    };

    var resolveTheme = function () {
      var explicitTheme = readStoredTheme() || readCookieTheme();
      if (explicitTheme) {
        return explicitTheme;
      }

      if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
        return "light";
      }

      return fallbackTheme;
    };

    var theme = resolveTheme();

    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    root.classList.remove("theme-dark", "theme-light");
    root.classList.add(theme === "light" ? "theme-light" : "theme-dark");
  })();
`;

export const buildThemeInitScript = (fallbackTheme: ThemeMode = DEFAULT_THEME) =>
  applyThemeScript
    .replace("__THEME_STORAGE_KEY__", THEME_STORAGE_KEY)
    .replace("__THEME_COOKIE_NAME__", THEME_COOKIE_NAME)
    .replace("__DEFAULT_THEME__", fallbackTheme);
