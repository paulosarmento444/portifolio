import type { ReactNode } from "react";
import { ThemeProvider, type ThemeMode } from "@site/shared";
import Header from "./Header";
import Footer from "./Footer";
import { Toaster } from "./toaster";

interface AppShellProps {
  children: ReactNode;
  initialTheme: ThemeMode;
  initialAccountName?: string;
}

export function AppShell({
  children,
  initialTheme,
  initialAccountName,
}: Readonly<AppShellProps>) {
  return (
    <ThemeProvider initialTheme={initialTheme}>
      <a href="#main-content" className="site-button-primary site-skip-link">
        Pular para o conteúdo
      </a>
      <Header initialAccountName={initialAccountName} />
      <div className="site-shell-background relative isolate z-0 flex min-h-screen flex-col">
        <div id="main-content" tabIndex={-1} className="flex-1 outline-none">
          {children}
        </div>
        <Footer />
      </div>
      <Toaster />
    </ThemeProvider>
  );
}
