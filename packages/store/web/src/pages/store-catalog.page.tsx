import { StoreCatalogClient } from "../components/catalog/store-catalog.client";
import { loadCatalogSnapshot } from "../server/catalog-snapshot";

export async function StoreCatalogPage() {
  try {
    const listing = await loadCatalogSnapshot();

    return (
      <StoreCatalogClient
        initialProducts={listing.products}
        initialCategories={listing.categories}
      />
    );
  } catch (error) {
    console.error("Error loading store catalog:", error);

    return (
      <StoreCatalogClient
        initialProducts={[]}
        initialCategories={[]}
        initialError="Erro ao carregar dados. Tente novamente."
      />
    );
  }
}
