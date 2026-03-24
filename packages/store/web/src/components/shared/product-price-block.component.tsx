import type { MoneyValueView } from "@site/shared";
import { StatusBadge, cn } from "@site/shared";
import { formatMoney } from "../../lib/store.utils";

interface ProductPriceBlockProps {
  price: MoneyValueView;
  regularPrice: MoneyValueView;
  onSale: boolean;
  discountPercentage?: number;
  showDiscountBadge?: boolean;
  size?: "sm" | "md" | "lg";
  align?: "start" | "end";
}

const sizeClassMap = {
  sm: {
    current: "text-lg md:text-xl",
    regular: "text-sm",
    wrapper: "gap-1.5",
  },
  md: {
    current: "text-2xl md:text-3xl",
    regular: "text-sm md:text-base",
    wrapper: "gap-2",
  },
  lg: {
    current: "text-3xl md:text-4xl",
    regular: "text-base md:text-lg",
    wrapper: "gap-3",
  },
} as const;

export function ProductPriceBlock({
  price,
  regularPrice,
  onSale,
  discountPercentage = 0,
  showDiscountBadge = true,
  size = "md",
  align = "start",
}: Readonly<ProductPriceBlockProps>) {
  const sizeClasses = sizeClassMap[size];

  return (
    <div
      className={cn(
        "flex flex-wrap items-center",
        sizeClasses.wrapper,
        align === "end" && "justify-end text-right",
      )}
    >
      <span
        className={cn(
          "font-semibold tracking-[-0.03em] text-[color:var(--site-color-foreground-strong)]",
          sizeClasses.current,
        )}
      >
        {formatMoney(price)}
      </span>

      {onSale ? (
        <>
          <span
            className={cn(
              "text-[color:var(--site-color-foreground-soft)] line-through",
              sizeClasses.regular,
            )}
          >
            {formatMoney(regularPrice)}
          </span>
          {showDiscountBadge && discountPercentage > 0 ? (
            <StatusBadge tone="danger">-{discountPercentage}%</StatusBadge>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
