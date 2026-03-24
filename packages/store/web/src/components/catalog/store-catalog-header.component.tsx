import { StatusBadge, EditorialIntro } from "@site/shared";

interface StoreCatalogHeaderProps {
  resultCount: number;
  activeFiltersCount: number;
  selectedCategoryName: string | null;
  searchTerm: string;
}

export function StoreCatalogHeader({
  resultCount,
  activeFiltersCount,
  selectedCategoryName,
  searchTerm,
}: Readonly<StoreCatalogHeaderProps>) {
  const hasSearch = searchTerm.trim().length > 0;

  return (
    <EditorialIntro
      eyebrow="Loja"
      title="Todos os produtos"
      description="Uma vitrine mais clara para comparar categorias, filtrar com calma e seguir para a compra com menos ruído visual."
      density="hero"
      contentWidth="md"
      descriptionWidth="sm"
      meta={
        <>
          <span>{resultCount} produto{resultCount !== 1 && "s"}</span>
          {selectedCategoryName ? (
            <>
              <span className="text-[color:var(--store-catalog-border-strong)]">•</span>
              <span>{selectedCategoryName}</span>
            </>
          ) : null}
          {hasSearch ? (
            <>
              <span className="text-[color:var(--store-catalog-border-strong)]">•</span>
              <span>Busca ativa</span>
            </>
          ) : null}
        </>
      }
      actions={
        <>
          {selectedCategoryName ? <StatusBadge tone="info">{selectedCategoryName}</StatusBadge> : null}
          {hasSearch ? <StatusBadge tone="warning">Busca ativa</StatusBadge> : null}
          {activeFiltersCount > 0 ? (
            <StatusBadge tone="neutral">
              {activeFiltersCount} filtro{activeFiltersCount !== 1 && "s"}
            </StatusBadge>
          ) : null}
        </>
      }
    />
  );
}
