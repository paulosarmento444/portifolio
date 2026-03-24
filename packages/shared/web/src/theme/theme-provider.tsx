"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_THEME,
  THEME_COOKIE_NAME,
  THEME_STORAGE_KEY,
  getCookieThemeValue,
  getSystemTheme,
  isThemeMode,
  type ThemeMode,
} from "./theme.constants";

interface ThemeContextValue {
  theme: ThemeMode;
  resolvedTheme: ThemeMode;
  isLoaded: boolean;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

interface ThemeProviderProps {
  children: ReactNode;
  initialTheme?: ThemeMode;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const applyThemeToDocument = (theme: ThemeMode) => {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  root.classList.remove("theme-dark", "theme-light");
  root.classList.add(theme === "light" ? "theme-light" : "theme-dark");
};

const persistTheme = (theme: ThemeMode) => {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore persistence failures in restricted environments.
    }
  }

  if (typeof document !== "undefined") {
    document.cookie = `${THEME_COOKIE_NAME}=${theme}; Path=/; Max-Age=31536000; SameSite=Lax`;
  }
};

const readDocumentTheme = (): ThemeMode | null => {
  if (typeof document === "undefined") {
    return null;
  }

  const currentTheme = document.documentElement.dataset.theme;
  return isThemeMode(currentTheme) ? currentTheme : null;
};

const readCookieTheme = (): ThemeMode | null => {
  if (typeof document === "undefined") {
    return null;
  }

  const cookieMatch = document.cookie.match(
    new RegExp(`(?:^|; )${THEME_COOKIE_NAME}=([^;]+)`),
  );

  return getCookieThemeValue(cookieMatch ? decodeURIComponent(cookieMatch[1]) : null);
};

const readExplicitThemePreference = (): ThemeMode | null => {
  if (typeof window !== "undefined") {
    try {
      const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (isThemeMode(storedTheme)) {
        return storedTheme;
      }
    } catch {
      // Ignore storage access issues and fall back to cookies.
    }
  }

  return readCookieTheme();
};

export function ThemeProvider({
  children,
  initialTheme = DEFAULT_THEME,
}: Readonly<ThemeProviderProps>) {
  const [theme, setThemeState] = useState<ThemeMode>(initialTheme);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const documentTheme = readDocumentTheme();
    const nextTheme = documentTheme ?? readExplicitThemePreference() ?? initialTheme;

    applyThemeToDocument(nextTheme);
    setThemeState(nextTheme);
    setIsLoaded(true);
  }, [initialTheme]);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: light)");

    const handleThemeChange = () => {
      if (readExplicitThemePreference()) {
        return;
      }

      const nextTheme = mediaQuery.matches ? "light" : "dark";
      applyThemeToDocument(nextTheme);
      setThemeState(nextTheme);
    };

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleThemeChange);
      return () => mediaQuery.removeEventListener("change", handleThemeChange);
    }

    mediaQuery.addListener(handleThemeChange);
    return () => mediaQuery.removeListener(handleThemeChange);
  }, []);

  const setTheme = useCallback((nextTheme: ThemeMode) => {
    applyThemeToDocument(nextTheme);
    persistTheme(nextTheme);
    setThemeState(nextTheme);
    setIsLoaded(true);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [setTheme, theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      resolvedTheme: theme,
      isLoaded,
      setTheme,
      toggleTheme,
    }),
    [isLoaded, setTheme, theme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider.");
  }

  return context;
};

export const resolveInitialClientTheme = (): ThemeMode => {
  const documentTheme = readDocumentTheme();
  return documentTheme ?? getSystemTheme();
};
