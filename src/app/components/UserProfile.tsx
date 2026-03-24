import Image from "next/image";
import Link from "next/link";

interface UserProfileProps {
    name?: string;
}

export const UserProfile = ({ name }: UserProfileProps) => {
    const isAuthenticated = Boolean(name?.trim());
    const displayName = isAuthenticated ? name?.trim() : "Entrar";

    return (
        <Link
            href={isAuthenticated ? "/my-account" : "/auth/login"}
            aria-label={
                isAuthenticated
                    ? `Abrir conta de ${displayName}`
                    : "Entrar ou criar conta"
            }
            className="site-focus-ring inline-flex min-h-11 items-center gap-3 rounded-full border border-[color:var(--site-color-border)] bg-[color:var(--site-color-surface)] px-2.5 py-2 text-[color:var(--site-color-foreground-strong)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[color:var(--site-color-border-strong)] hover:bg-[color:var(--site-color-surface-strong)] hover:shadow-[var(--site-shadow-sm)]"
        >
            <Image
                src="/avatar.svg"
                alt="Perfil"
                width={40}
                height={40}
                className="h-10 w-10 rounded-full bg-[color:var(--site-color-surface-inset)]"
            />
            <div className="hidden min-w-0 text-left xl:block">
                <p className="site-text-meta uppercase tracking-[0.14em]">
                    Conta
                </p>
                <p className="truncate text-sm font-semibold text-[color:var(--site-color-foreground-strong)]">
                    {displayName}
                </p>
            </div>
        </Link>
    );
};
