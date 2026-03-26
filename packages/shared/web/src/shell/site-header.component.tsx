"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu, ShoppingBag, UserRound } from "lucide-react";
import { DrawerShell, IconButton, cn } from "../ui";
import { resolveAccountFirstName } from "./account-display.utils";
import { AccountProfileLink } from "./account-profile-link.component";
import { SiteLogo } from "./site-logo.component";
import { SiteNavLinks } from "./site-nav-links.component";
import { utilityNavigation } from "./site-shell.config";
import { StoreSearchShortcut } from "./store-search-shortcut.component";
import { ThemeToggleButton } from "./theme-toggle-button.component";
import { useScroll } from "./use-scroll.hook";

interface HeaderProps {
  initialAccountName?: string;
}

export function SiteHeader({
  initialAccountName = "",
}: Readonly<HeaderProps>) {
  const pathname = usePathname();
  const isScrolled = useScroll();
  const headerRef = useRef<HTMLElement | null>(null);
  const [userName, setUserName] = useState(() =>
    resolveAccountFirstName(initialAccountName),
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setUserName(resolveAccountFirstName(initialAccountName));
  }, [initialAccountName]);

  useLayoutEffect(() => {
    const syncShellOffset = () => {
      const nextHeight = headerRef.current?.offsetHeight;

      if (!nextHeight) {
        return;
      }

      document.documentElement.style.setProperty(
        "--site-shell-offset",
        `${nextHeight}px`,
      );
    };

    syncShellOffset();
    window.addEventListener("resize", syncShellOffset);

    return () => {
      window.removeEventListener("resize", syncShellOffset);
    };
  }, [pathname, userName]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const accountLabel = userName || "Entrar";

  const drawerUtilityNavigation = useMemo(() => {
    return utilityNavigation.map((item) => {
      if (item.href !== "/my-account") {
        return item;
      }

      if (userName) {
        return item;
      }

      return {
        ...item,
        href: "/auth/login",
        label: "Entrar",
        description: "Acesse sua conta e acompanhe pedidos",
      };
    });
  }, [userName]);

  return (
    <header
      ref={headerRef}
      data-testid="site-header"
      className="fixed inset-x-0 top-0 z-50"
    >
      <div className="site-container site-container-marketing pt-3 sm:pt-4">
        <div
          className={cn(
            "overflow-hidden rounded-[2rem] border border-[color:var(--site-color-border)] bg-[color:var(--site-color-surface-strong)] px-3 py-3 backdrop-blur-xl sm:px-4 lg:px-6",
            isScrolled && "shadow-[var(--site-shadow-md)]",
          )}
        >
          <div className="grid min-h-[4.5rem] grid-cols-[minmax(0,1fr)_auto] items-center gap-3 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:gap-6">
            <div className="flex min-w-0 items-center gap-3 lg:gap-4">
              <Link href="/" className="shrink-0" aria-label="Solar Esportes">
                <SiteLogo />
              </Link>
            </div>

            <div className="hidden min-w-0 justify-center lg:flex">
              <SiteNavLinks />
            </div>

            <div className="ml-auto flex min-w-0 items-center justify-end gap-2 sm:gap-2.5 lg:gap-3">
              <StoreSearchShortcut
                compact
                className="hidden lg:flex lg:min-w-[12.5rem] xl:min-w-[17rem]"
              />

              <Link
                href="/my-cart"
                aria-label="Carrinho"
                className="site-focus-ring inline-flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--site-color-border)] bg-[color:var(--site-color-surface-strong)] text-[color:var(--site-color-foreground-strong)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[color:var(--site-color-border-strong)] hover:shadow-[var(--site-shadow-sm)]"
              >
                <ShoppingBag className="h-5 w-5" />
              </Link>

              <div className="hidden items-center gap-2 lg:flex">
                <ThemeToggleButton />
                <AccountProfileLink name={initialAccountName} />
              </div>

              <div className="flex items-center gap-2 lg:hidden">
                <ThemeToggleButton />
                <IconButton
                  icon={<Menu className="h-5 w-5" />}
                  label="Abrir navegação"
                  variant="secondary"
                  onClick={() => setIsMobileMenuOpen(true)}
                  aria-haspopup="dialog"
                  aria-expanded={isMobileMenuOpen}
                  aria-controls="site-mobile-drawer"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-[color:var(--site-color-border)] pt-3 lg:hidden">
            <StoreSearchShortcut />
          </div>
        </div>
      </div>

      <DrawerShell
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        side="right"
        panelId="site-mobile-drawer"
        title="Navegação"
        description="Acesso direto a loja, conteúdo e conta em um menu mais leve para telas menores."
        className="max-w-[24rem]"
        contentClassName="pb-6"
      >
        <div className="site-stack-section">
          <div className="rounded-[1.75rem] border border-[color:var(--site-color-border)] bg-[color:var(--site-color-surface-strong)] p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="site-stack-panel min-w-0 flex-1 gap-1">
                <p className="site-text-meta uppercase tracking-[0.14em]">Conta</p>
                <p className="truncate text-lg font-semibold text-[color:var(--site-color-foreground-strong)]">
                  {accountLabel}
                </p>
                <p className="site-text-body text-sm">
                  {userName
                    ? "Pedidos, endereços e histórico ficam a um toque de distância."
                    : "Entre para acompanhar pedidos e comprar com mais rapidez."}
                </p>
              </div>
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[color:var(--site-color-primary-soft)] text-[color:var(--site-color-primary)]">
                <UserRound className="h-5 w-5" />
              </span>
            </div>

            <div className="mt-4">
              <ThemeToggleButton variant="button" fullWidth />
            </div>
          </div>

          <div className="site-stack-panel gap-3">
            <p className="site-text-meta px-1 uppercase tracking-[0.14em]">Explorar</p>
            <SiteNavLinks
              id="site-mobile-navigation"
              variant="drawer"
              onNavigate={() => setIsMobileMenuOpen(false)}
            />
          </div>

          <div className="rounded-[1.75rem] border border-[color:var(--site-color-border)] bg-[color:var(--site-color-surface)] p-5">
            <div className="site-stack-panel gap-4">
              <div className="site-stack-panel gap-1">
                <p className="site-text-meta uppercase tracking-[0.14em]">Ações rápidas</p>
                <p className="text-sm font-medium text-[color:var(--site-color-foreground-muted)]">
                  Continue a navegação do ponto em que fizer mais sentido para você.
                </p>
              </div>

              <div className="grid gap-3">
                {drawerUtilityNavigation.map(({ href, label, description, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="site-focus-ring flex items-center gap-3 rounded-[1.25rem] bg-white/70 px-4 py-3 text-sm text-[color:var(--site-color-foreground-muted)] transition-all duration-200 hover:bg-white hover:text-[color:var(--site-color-foreground-strong)] dark:bg-white/5 dark:hover:bg-white/10"
                  >
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--site-color-primary-soft)] text-[color:var(--site-color-primary)]">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-[color:var(--site-color-foreground-strong)]">
                        {label}
                      </span>
                      <span className="site-text-meta block truncate">{description}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <Link
            href="/store"
            onClick={() => setIsMobileMenuOpen(false)}
            className="site-button-primary w-full"
          >
            Abrir loja
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </DrawerShell>
    </header>
  );
}
