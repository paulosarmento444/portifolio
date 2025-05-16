import { Product } from "@/app/types/product";

export const ProductInfo = ({ product }: { product: Product }) => (
  <div className="absolute bottom-0 w-full rounded-b-md bg-zinc-800 p-4 text-white">
    <p className="font-bold text-lg">{product.name}</p>
    <p className="text-sm">{product.price}</p>
  </div>
);
