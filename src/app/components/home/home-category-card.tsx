import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Bike,
  Dumbbell,
  Footprints,
  Shield,
  Trophy,
  Watch,
  Zap,
} from "lucide-react";
import type { HomeCategoryHighlight } from "./home.types";

const resolveCategoryIcon = (category: Pick<HomeCategoryHighlight, "name" | "slug">) => {
  const haystack = `${category.name} ${category.slug}`.toLowerCase();

  if (haystack.includes("chute") || haystack.includes("soccer") || haystack.includes("boot")) {
    return Footprints;
  }

  if (haystack.includes("aces") || haystack.includes("watch") || haystack.includes("relog")) {
    return Watch;
  }

  if (haystack.includes("bike") || haystack.includes("cicl")) {
    return Bike;
  }

  if (haystack.includes("train") || haystack.includes("treino") || haystack.includes("gym")) {
    return Dumbbell;
  }

  if (haystack.includes("perform") || haystack.includes("speed")) {
    return Zap;
  }

  if (haystack.includes("elite") || haystack.includes("pro")) {
    return Trophy;
  }

  if (haystack.includes("prote") || haystack.includes("guard")) {
    return Shield;
  }

  return Activity;
};

interface HomeCategoryCardProps {
  category: HomeCategoryHighlight;
}

export default function HomeCategoryCard({ category }: Readonly<HomeCategoryCardProps>) {
  const Icon = resolveCategoryIcon(category);
  const description =
    category.description?.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() ||
    "Acesse uma categoria real do catálogo com produtos publicados e navegação direta para a loja.";

  return (
    <Link href={`/store?category=${category.id}`} className="group block h-full" aria-label={`Abrir categoria ${category.name}`}>
      <article className="flex h-full flex-col rounded-[1.8rem] bg-white px-6 py-6 shadow-[var(--site-shadow-md)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--site-shadow-lg)] dark:bg-[color:var(--site-color-surface-strong)]">
        <div className="flex items-start justify-between gap-4">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-[color:var(--site-color-primary-soft)] text-[color:var(--site-color-primary)]">
            <Icon className="h-6 w-6" />
          </span>
          <span className="rounded-full bg-[color:var(--site-color-interactive-muted)] px-3 py-1 text-xs font-semibold text-[color:var(--site-color-foreground-muted)]">
            {category.count} produtos
          </span>
        </div>

        <div className="mt-6 flex-1 space-y-3">
          <h3 className="text-[1.3rem] font-semibold leading-8 tracking-[-0.04em] text-[color:var(--site-color-foreground-strong)] transition-colors group-hover:text-[color:var(--site-color-primary)]">
            {category.name}
          </h3>
          <p className="site-text-body line-clamp-3 text-sm">{description}</p>
        </div>

        <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--site-color-foreground-strong)]">
          Explorar categoria
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--site-color-primary-soft)] text-[color:var(--site-color-primary)] transition-transform duration-200 group-hover:translate-x-1">
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </article>
    </Link>
  );
}
