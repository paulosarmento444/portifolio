import Image from "next/image";
import Link from "next/link";
import { Product } from "@/app/types/product";
import { ProductInfo } from "@/app/components/product/ProductInfo";

export const ProductCard = ({ product }: { product: Product }) => (
  <Link href={`/store/${product.id}`} passHref>
    <div className="group relative rounded-lg overflow-hidden bg-zinc-900 transform transition-transform duration-300 hover:scale-105 hover:z-10 cursor-pointer">
      <Image
        alt={product.name}
        src={product.images[0]?.src || "/default-image.jpg"}
        width={600}
        height={400}
        className="object-cover w-full h-60 transition-transform duration-300 group-hover:scale-110"
      />

      <div className="absolute inset-0 flex flex-col bg-black bg-opacity-70 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="flex gap-1 p-2 z-20">
          {product.images.slice(1, 4).map((image, index) => (
            <Image
              key={index}
              src={image.src}
              alt={`Thumbnail ${index + 1}`}
              width={44}
              height={44}
              className="cursor-pointer rounded border border-gray-200 object-cover transition-transform transform hover:scale-110"
            />
          ))}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-black bg-opacity-70 rounded-t-md z-10">
          <ProductInfo product={product} />
        </div>
      </div>
    </div>
  </Link>
);
