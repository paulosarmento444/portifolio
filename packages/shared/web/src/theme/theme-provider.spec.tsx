import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ThemeProvider, useTheme } from "./theme-provider";
import { THEME_STORAGE_KEY } from "./theme.constants";

const ThemeConsumer = () => {
  const { isLoaded, theme, toggleTheme } = useTheme();

  return (
    <button type="button" onClick={toggleTheme}>
      {isLoaded ? theme : "loading"}
    </button>
  );
};

const createMatchMedia = (matches: boolean) =>
  jest.fn().mockImplementation(() => ({
    matches,
    media: "(prefers-color-scheme: light)",
    onchange: null,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));

describe("ThemeProvider", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.cookie = "solar-esportes-theme=; Path=/; Max-Age=0";
    document.documentElement.dataset.theme = "dark";
    document.documentElement.className = "theme-dark";
    document.documentElement.style.colorScheme = "dark";
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: createMatchMedia(false),
    });
  });

  it("syncs the initial theme from the document and persists theme toggles", async () => {
    render(
      <ThemeProvider initialTheme="dark">
        <ThemeConsumer />
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(screen.getByRole("button")).toHaveTextContent("dark");
    });

    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(document.documentElement.dataset.theme).toBe("light");
    });

    expect(document.documentElement.classList.contains("theme-light")).toBe(true);
    expect(document.documentElement.style.colorScheme).toBe("light");
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
    expect(document.cookie).toContain("solar-esportes-theme=light");
  });

  it("respects the theme already applied by the bootstrap script", async () => {
    document.documentElement.dataset.theme = "light";
    document.documentElement.className = "theme-light";
    document.documentElement.style.colorScheme = "light";

    render(
      <ThemeProvider initialTheme="dark">
        <ThemeConsumer />
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(screen.getByRole("button")).toHaveTextContent("light");
    });
  });

  it("does not overwrite an explicit cookie preference when system theme changes", async () => {
    let changeHandler: (() => void) | null = null;

    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: jest.fn().mockImplementation(() => ({
        matches: false,
        media: "(prefers-color-scheme: light)",
        onchange: null,
        addEventListener: (_event: string, handler: () => void) => {
          changeHandler = handler;
        },
        removeEventListener: jest.fn(),
        addListener: (handler: () => void) => {
          changeHandler = handler;
        },
        removeListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });

    document.cookie = "solar-esportes-theme=light; Path=/";
    document.documentElement.dataset.theme = "light";
    document.documentElement.className = "theme-light";
    document.documentElement.style.colorScheme = "light";

    render(
      <ThemeProvider initialTheme="dark">
        <ThemeConsumer />
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(screen.getByRole("button")).toHaveTextContent("light");
    });

    act(() => {
      changeHandler?.();
    });

    expect(document.documentElement.dataset.theme).toBe("light");
    expect(screen.getByRole("button")).toHaveTextContent("light");
  });
});
