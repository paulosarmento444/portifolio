import type { ReactNode } from "react";
import type { ThemeMode } from "../theme";
import { ThemeProvider } from "../theme";
import { SiteFooter } from "./site-footer.component";
import { SiteHeader } from "./site-header.component";

interface SiteAppShellProps {
  children: ReactNode;
  initialTheme: ThemeMode;
  initialAccountName?: string;
}

export function SiteAppShell({
  children,
  initialTheme,
  initialAccountName,
}: Readonly<SiteAppShellProps>) {
  return (
    <ThemeProvider initialTheme={initialTheme}>
      <a href="#main-content" className="site-button-primary site-skip-link">
        Pular para o conteúdo
      </a>
      <SiteHeader initialAccountName={initialAccountName} />
      <div className="site-shell-background relative isolate z-0 flex min-h-screen flex-col">
        <div id="main-content" tabIndex={-1} className="flex-1 outline-none">
          {children}
        </div>
        <SiteFooter />
      </div>
    </ThemeProvider>
  );
}
