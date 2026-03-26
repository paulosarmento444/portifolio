import Image from "next/image";
import Link from "next/link";
import { resolveAccountFirstName } from "./account-display.utils";

interface AccountProfileLinkProps {
  name?: string;
}

export const AccountProfileLink = ({ name }: AccountProfileLinkProps) => {
  const fullName = name?.trim() || "";
  const isAuthenticated = Boolean(fullName);
  const displayName = isAuthenticated
    ? resolveAccountFirstName(fullName)
    : "Entrar";

  return (
    <Link
      href={isAuthenticated ? "/my-account" : "/auth/login"}
      aria-label={
        isAuthenticated
          ? `Abrir conta de ${fullName}`
          : "Entrar ou criar conta"
      }
      title={isAuthenticated ? fullName : undefined}
      className="site-focus-ring inline-flex min-h-11 max-w-[11rem] min-w-0 items-center gap-2.5 rounded-full border border-[color:var(--site-color-border)] bg-[color:var(--site-color-surface)] px-2.5 py-2 text-[color:var(--site-color-foreground-strong)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[color:var(--site-color-border-strong)] hover:bg-[color:var(--site-color-surface-strong)] hover:shadow-[var(--site-shadow-sm)] xl:max-w-[12rem]"
    >
      <Image
        src="/avatar.svg"
        alt="Perfil"
        width={40}
        height={40}
        className="h-10 w-10 shrink-0 rounded-full bg-[color:var(--site-color-surface-inset)]"
      />
      <div className="hidden min-w-0 flex-1 text-left xl:block">
        <p className="site-text-meta uppercase tracking-[0.14em]">
          Conta
        </p>
        <p className="truncate text-[0.95rem] font-semibold text-[color:var(--site-color-foreground-strong)]">
          {displayName}
        </p>
      </div>
    </Link>
  );
};
