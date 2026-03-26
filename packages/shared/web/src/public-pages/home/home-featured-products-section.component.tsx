import Link from "next/link";
import type { CatalogProductCardView } from "../../contracts";
import { EditorialIntro, EmptyState, SectionShell } from "../../ui";
import HomeProductCard from "./home-product-card.component";

interface HomeFeaturedProductsSectionProps {
  products: CatalogProductCardView[];
}

export default function HomeFeaturedProductsSection({
  products,
}: Readonly<HomeFeaturedProductsSectionProps>) {
  return (
    <SectionShell container="commerce" spacing="default" stack="page" id="featured-products">
      <EditorialIntro
        eyebrow="Destaques"
        title="Uma vitrine mais limpa para comparar produto, preço e próxima ação de relance."
        description="Os destaques usam dados reais do catálogo e dão mais protagonismo à imagem, ao nome e ao preço para a jornada começar com mais apelo comercial."
        density="compact"
        contentWidth="md"
        descriptionWidth="sm"
        actions={
          <Link href="/store" className="site-button-secondary">
            Ver tudo
          </Link>
        }
      />

      {products.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <HomeProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <EmptyState
          eyebrow="Sem destaques"
          title="Ainda não há produtos publicados para a vitrine principal."
          description="Assim que o catálogo tiver produtos ativos, esta área passa a refletir os itens reais do ecommerce automaticamente."
          action={
            <Link href="/store" className="site-button-primary">
              Abrir loja
            </Link>
          }
        />
      )}
    </SectionShell>
  );
}
