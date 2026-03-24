"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@site/shared";
import { primaryNavigation } from "./shell.config";

type NavLinksVariant = "desktop" | "drawer";

interface NavLinksProps {
  variant?: NavLinksVariant;
  onNavigate?: () => void;
  id?: string;
}

const isActivePath = (pathname: string, href: string) => {
  if (href === "/") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
};

export const NavLinks = ({ variant = "desktop", onNavigate, id }: NavLinksProps) => {
  const pathname = usePathname();

  if (variant === "drawer") {
    return (
      <nav id={id} aria-label="Navegação principal" className="grid gap-2.5">
        {primaryNavigation.map(({ href, label, description, icon: Icon }) => {
          const isActive = isActivePath(pathname, href);

          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "site-focus-ring flex min-h-[4.25rem] items-center gap-4 rounded-[1.4rem] px-4 py-3 transition-all duration-200",
                isActive
                  ? "bg-[color:var(--site-color-primary-soft)] text-[color:var(--site-color-foreground-strong)]"
                  : "bg-[color:var(--site-color-surface)] text-[color:var(--site-color-foreground-muted)] hover:bg-[color:var(--site-color-surface-strong)] hover:text-[color:var(--site-color-foreground-strong)]",
              )}
            >
              <span
                className={cn(
                  "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
                  isActive
                    ? "bg-[color:var(--site-color-primary)] text-white"
                    : "bg-[color:var(--site-color-interactive-muted)] text-[color:var(--site-color-foreground-soft)]",
                )}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-base font-semibold text-[color:var(--site-color-foreground-strong)]">
                  {label}
                </span>
                <span className="site-text-meta block truncate">{description}</span>
              </span>
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav id={id} aria-label="Navegação principal" className="hidden lg:flex justify-center">
      <ul className="flex items-center gap-1 xl:gap-2">
        {primaryNavigation.map(({ href, label }) => {
          const isActive = isActivePath(pathname, href);

          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "site-focus-ring inline-flex min-h-11 items-center rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-200 xl:px-5",
                  isActive
                    ? "bg-[color:var(--site-color-surface-strong)] text-[color:var(--site-color-foreground-strong)] shadow-[var(--site-shadow-sm)]"
                    : "text-[color:var(--site-color-foreground-muted)] hover:bg-[color:var(--site-color-surface)] hover:text-[color:var(--site-color-foreground-strong)]",
                )}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
