import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { SectionShell } from "@site/shared";
import type {
  AddToCartAction,
  StoreProductDetail,
  StoreProductVariation,
} from "../../lib/store.types";
import { ProductGallery } from "./product-gallery.component";
import { ProductInfo } from "./product-info.component";

interface ProductHeroProps {
  product: StoreProductDetail;
  currentProduct: StoreProductDetail;
  selectedVariation: StoreProductVariation | null;
  selectedColor: string;
  selectedSize: string;
  colorOptions: Array<{ value: string; disabled: boolean }>;
  sizeOptions: Array<{ value: string; disabled: boolean }>;
  setSelectedColor: (color: string) => void;
  setSelectedSize: (size: string) => void;
  addToCartAction: AddToCartAction;
}

export function ProductHero({
  product,
  currentProduct,
  selectedVariation,
  selectedColor,
  selectedSize,
  colorOptions,
  sizeOptions,
  setSelectedColor,
  setSelectedSize,
  addToCartAction,
}: ProductHeroProps) {
  return (
    <SectionShell container="commerce" spacing="compact" stack="page">
      <div className="flex items-center justify-between gap-3">
        <Link href="/store" className="site-button-ghost">
          <ArrowLeft className="h-4 w-4" />
          Voltar para a loja
        </Link>
      </div>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(29rem,33rem)] xl:items-start xl:gap-10 2xl:grid-cols-[minmax(0,1.05fr)_minmax(31rem,35rem)]">
        <div className="min-w-0 xl:sticky xl:top-28">
          <ProductGallery product={product} selectedVariation={selectedVariation} />
        </div>

        <div className="min-w-0">
          <ProductInfo
            product={product}
            currentProduct={currentProduct}
            selectedColor={selectedColor}
            selectedSize={selectedSize}
            colorOptions={colorOptions}
            sizeOptions={sizeOptions}
            setSelectedColor={setSelectedColor}
            setSelectedSize={setSelectedSize}
            addToCartAction={addToCartAction}
          />
        </div>
      </div>
    </SectionShell>
  );
}
