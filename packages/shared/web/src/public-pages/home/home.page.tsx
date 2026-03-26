import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { loadCatalogSnapshot } from "@site/store";
import type { CatalogCategoryView, CatalogProductCardView } from "../../contracts";
import { EmptyState, SectionShell } from "../../ui";
import HomeCategoriesSection from "./home-categories-section.component";
import HomeEditorialSection from "./home-editorial-section.component";
import HomeFeaturedProductsSection from "./home-featured-products-section.component";
import HomeHeroSection from "./home-hero-section.component";
import HomeTrustSection from "./home-trust-section.component";
import type { HomeCategoryHighlight } from "./home.types";

const buildCategoryHighlights = (
  categories: CatalogCategoryView[],
  products: CatalogProductCardView[],
): HomeCategoryHighlight[] => {
  const countMap = new Map<string, number>();

  products.forEach((product) => {
    product.categories.forEach((category) => {
      countMap.set(category.id, (countMap.get(category.id) ?? 0) + 1);
    });
  });

  return categories
    .map((category) => ({
      ...category,
      count: countMap.get(category.id) ?? 0,
    }))
    .filter((category) => category.count > 0)
    .sort((left, right) => right.count - left.count);
};

const pickFeaturedProducts = (products: CatalogProductCardView[]) => {
  const featured = products.filter((product) => product.featured);
  return (featured.length > 0 ? featured : products).slice(0, 4);
};

const buildHomeMerchandisingSelection = (products: CatalogProductCardView[]) => {
  const featured = products.filter((product) => product.featured);
  const primaryPool = featured.length > 0 ? featured : products;
  const showcaseProduct = primaryPool[0] ?? products[0] ?? null;
  const supportingCandidates = [
    ...primaryPool.slice(1),
    ...products.filter((product) => product.id !== showcaseProduct?.id),
  ];
  const seenIds = new Set<string>();
  const supportingProducts = supportingCandidates.filter((product) => {
    if (product.id === showcaseProduct?.id || seenIds.has(product.id)) {
      return false;
    }

    seenIds.add(product.id);
    return true;
  });

  return {
    showcaseProduct,
    supportingProducts: supportingProducts.slice(0, 4),
  };
};

export async function PublicHomePage() {
  try {
    const { categories, products } = await loadCatalogSnapshot();

    const categoryHighlights = buildCategoryHighlights(categories, products);
    const featuredProducts = pickFeaturedProducts(products);
    const { showcaseProduct, supportingProducts } = buildHomeMerchandisingSelection(products);
    const featuredGridProducts =
      supportingProducts.length > 0
        ? supportingProducts
        : featuredProducts.filter((product) => product.id !== showcaseProduct?.id);

    return (
      <div className="site-stack-page">
        <HomeHeroSection
          product={showcaseProduct}
          productCount={products.length}
          categoryCount={categoryHighlights.length}
          featuredCategories={categoryHighlights.slice(0, 4)}
        />
        <HomeTrustSection />
        <HomeFeaturedProductsSection
          products={(featuredGridProducts.length > 0 ? featuredGridProducts : featuredProducts).slice(0, 4)}
        />
        <HomeCategoriesSection categories={categoryHighlights.slice(0, 4)} />
        <HomeEditorialSection />
      </div>
    );
  } catch (error) {
    console.error("Error loading home storefront:", error);

    return (
      <SectionShell container="marketing" spacing="hero" stack="page">
        <EmptyState
          eyebrow="Home indisponível"
          title="Não foi possível montar a vitrine principal agora."
          description="O catálogo continua disponível e você pode seguir para a loja completa sem perder a navegação do ecommerce."
          action={
            <Link href="/store" className="site-button-primary">
              Abrir loja
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
      </SectionShell>
    );
  }
}
