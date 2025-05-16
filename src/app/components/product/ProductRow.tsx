import { Products } from "@/app/types/product";
import { ProductCard } from "./ProductCard";

type ProductRowProps = {
  sectionTitle: string;
  products: Products;
};

export function ProductRow({ sectionTitle, products }: ProductRowProps) {
  return (
    <div className="flex flex-col space-y-4">
      <h2 className="text-2xl font-bold mb-4">{sectionTitle}</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
