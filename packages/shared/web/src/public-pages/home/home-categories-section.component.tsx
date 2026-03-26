import Link from "next/link";
import { EditorialIntro, SectionShell } from "../../ui";
import type { HomeCategoryHighlight } from "./home.types";
import HomeCategoryCard from "./home-category-card.component";

interface HomeCategoriesSectionProps {
  categories: HomeCategoryHighlight[];
}

export default function HomeCategoriesSection({
  categories,
}: Readonly<HomeCategoriesSectionProps>) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <SectionShell container="marketing" spacing="default" stack="page" id="home-categories">
      <EditorialIntro
        eyebrow="Categorias"
        title="Comece pela modalidade ou pelo tipo de produto que combina com o seu momento."
        description="As categorias em evidência ajudam a entrar na loja por um caminho mais direto, sem poluir a navegação com excesso de informação logo de saída."
        density="compact"
        contentWidth="md"
        descriptionWidth="sm"
        actions={
          <Link href="/store" className="site-button-ghost">
            Ver catálogo completo
          </Link>
        }
      />

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {categories.map((category) => (
          <HomeCategoryCard key={category.id} category={category} />
        ))}
      </div>
    </SectionShell>
  );
}
