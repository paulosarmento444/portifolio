"use client";

import { Moon, Sun, SunMoon } from "lucide-react";
import { useTheme } from "../theme";
import { IconButton, SecondaryButton } from "../ui";

interface ThemeToggleButtonProps {
  variant?: "icon" | "button";
  fullWidth?: boolean;
}

export function ThemeToggleButton({
  variant = "icon",
  fullWidth = false,
}: Readonly<ThemeToggleButtonProps>) {
  const { isLoaded, theme, toggleTheme } = useTheme();

  const nextTheme = isLoaded ? (theme === "dark" ? "light" : "dark") : null;
  const label = nextTheme
    ? `Ativar tema ${nextTheme === "light" ? "claro" : "escuro"}`
    : "Alternar tema";
  const icon = !isLoaded ? (
    <SunMoon className="h-5 w-5" />
  ) : theme === "dark" ? (
    <Sun className="h-5 w-5" />
  ) : (
    <Moon className="h-5 w-5" />
  );

  if (variant === "button") {
    return (
      <SecondaryButton
        type="button"
        fullWidth={fullWidth}
        onClick={toggleTheme}
        leadingIcon={icon}
      >
        {label}
      </SecondaryButton>
    );
  }

  return (
    <IconButton
      type="button"
      variant="secondary"
      icon={icon}
      label={label}
      onClick={toggleTheme}
    />
  );
}
