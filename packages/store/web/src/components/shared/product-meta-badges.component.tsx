import { StatusBadge } from "@site/shared";
import { resolveStockLabel } from "../../lib/store.utils";

interface ProductMetaBadgesProps {
  featured: boolean;
  onSale: boolean;
  type: string;
  stockStatus: string;
  discountPercentage?: number;
}

export function ProductMetaBadges({
  featured,
  onSale,
  type,
  stockStatus,
  discountPercentage = 0,
}: Readonly<ProductMetaBadgesProps>) {
  const stockLabel = resolveStockLabel(stockStatus);
  const stockTone = stockStatus === "instock" ? "success" : "danger";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <StatusBadge tone={stockTone}>{stockLabel}</StatusBadge>
      {featured ? <StatusBadge tone="warning">Destaque</StatusBadge> : null}
      {type === "variable" ? <StatusBadge tone="info">Variações</StatusBadge> : null}
      {onSale && discountPercentage > 0 ? (
        <StatusBadge tone="accent">Oferta -{discountPercentage}%</StatusBadge>
      ) : null}
    </div>
  );
}
