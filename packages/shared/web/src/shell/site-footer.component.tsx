import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionShell } from "../ui";
import { SiteLogo } from "./site-logo.component";
import {
  footerLinkGroups,
  footerMeta,
  footerQuickLinks,
  trustItems,
} from "./site-shell.config";

export function SiteFooter() {
  return (
    <footer
      aria-label="Rodapé do site"
      className="relative mt-20 border-t border-[color:var(--site-color-border)] bg-[color:var(--site-color-page-alt)]/50"
    >
      <SectionShell as="div" container="marketing" spacing="default" stack="page">
        <div className="grid gap-12 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1.85fr)] xl:items-start">
          <div className="site-stack-section max-w-xl">
            <div className="site-stack-panel gap-4">
              <SiteLogo />
              <p className="site-readable-sm text-base font-medium leading-7 text-[color:var(--site-color-foreground-muted)]">
                Uma vitrine mais direta para descobrir produtos, comparar com calma e concluir a compra sem ruído.
              </p>
            </div>

            <div className="site-action-cluster">
              {footerQuickLinks.slice(0, 2).map(({ href, label }) => (
                <Link key={href} href={href} className="site-button-secondary">
                  {label}
                </Link>
              ))}
            </div>

            <div className="grid gap-3 pt-2 sm:grid-cols-3">
              {trustItems.map(({ label, description, icon: Icon }) => (
                <div
                  key={label}
                  className="rounded-[1.5rem] bg-white/65 px-4 py-4 shadow-[var(--site-shadow-sm)] dark:bg-white/5"
                >
                  <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--site-color-primary-soft)] text-[color:var(--site-color-primary)]">
                    <Icon className="h-4 w-4" />
                  </span>
                  <p className="text-sm font-semibold text-[color:var(--site-color-foreground-strong)]">
                    {label}
                  </p>
                  <p className="site-text-meta mt-1 text-xs">{description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {footerLinkGroups.map((group) => (
              <div key={group.title} className="site-stack-panel gap-4">
                <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-[color:var(--site-color-foreground-soft)]">
                  {group.title}
                </h2>
                <ul className="grid gap-3">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="site-focus-ring block rounded-[1.25rem] px-2 py-2 transition-colors hover:bg-white/65 hover:text-[color:var(--site-color-foreground-strong)] dark:hover:bg-white/5"
                      >
                        <span className="block text-sm font-semibold text-[color:var(--site-color-foreground-strong)]">
                          {link.label}
                        </span>
                        {link.description ? (
                          <span className="site-text-meta mt-1 block text-xs">{link.description}</span>
                        ) : null}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="site-divider" />

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <p className="site-text-meta">
            © {new Date().getFullYear()} Solar Esportes. Catálogo, conteúdo e suporte conectados em uma experiência mais clara.
          </p>

          <div className="flex flex-wrap gap-3 text-sm text-[color:var(--site-color-foreground-muted)]">
            <a href={`mailto:${footerMeta.supportEmail}`} className="site-focus-ring inline-flex items-center gap-2 rounded-full px-3 py-2 hover:bg-white/65 dark:hover:bg-white/5">
              {footerMeta.supportEmail}
            </a>
            <Link href="/contact" className="site-focus-ring inline-flex items-center gap-2 rounded-full px-3 py-2 hover:bg-white/65 dark:hover:bg-white/5">
              Central de atendimento
            </Link>
            <Link href="/store" className="site-focus-ring inline-flex items-center gap-2 rounded-full px-3 py-2 hover:bg-white/65 dark:hover:bg-white/5">
              Abrir catálogo
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </SectionShell>
    </footer>
  );
}
