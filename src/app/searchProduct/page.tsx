import React from "react";
import Header from "../components/Header";
import { searchProducts } from "../service/ProductService";
import { ProductCard } from "../components/product/ProductCard";

interface ISearchParams {
  name?: string;
}

interface ISearchProps {
  searchParams: ISearchParams;
}

export default async function SearchProductResults({
  searchParams,
}: ISearchProps) {
  const { name } = searchParams;

  const products = await searchProducts(name);

  if (products.length === 0) {
    return (
      <div>
        <div className="relative bg-gradient-to-b pb-8">
          <main className="relative overflow-y-scroll p-8 pb-20 scrollbar-hide lg:px-16 mt-20">
            <h1 className="mb-4 text-2xl font-bold">
              Search results for: <span className="text-red-500">{name}</span>
            </h1>
            <p className="text-xl">No products found</p>
          </main>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div>
        <div className="relative bg-gradient-to-b pb-8">
          <main className="relative overflow-y-scroll p-8 pb-20 scrollbar-hide lg:px-16 mt-20">
            <h1 className="mb-4 text-2xl font-bold">
              Search results for: <span className="text-red-500">{name}</span>
            </h1>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-8">
              {products.map((product, index) => (
                <ProductCard key={index} product={product} />
              ))}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
