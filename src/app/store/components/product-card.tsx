"use client";

import type React from "react";

import { useState, useCallback, useMemo } from "react";
import Image from "next/image";
import { Package, Star } from "lucide-react";
import DOMPurify from "dompurify";

interface ProductCardProps {
  product: any;
  viewMode: "grid" | "list";
}

const truncateText = (html: string, maxLength: number): string => {
  if (!html) return "";

  const textOnly = html.replace(/<[^>]*>/g, "");
  const decoded = textOnly
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  const cleaned = decoded.replace(/\s+/g, " ").trim();

  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  const truncated = cleaned.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");

  if (lastSpace > maxLength * 0.8) {
    return truncated.substring(0, lastSpace) + "...";
  } else {
    return truncated + "...";
  }
};

export default function ProductCard({ product, viewMode }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);

  const imageUrl = imageError
    ? "/placeholder.svg?height=300&width=400"
    : product.images?.[0]?.src || "/placeholder.svg?height=300&width=400";

  const discountPercentage =
    product.on_sale && product.regular_price && product.sale_price
      ? Math.round(
          ((Number.parseFloat(product.regular_price) -
            Number.parseFloat(product.sale_price)) /
            Number.parseFloat(product.regular_price)) *
            100
        )
      : 0;

  const handleProductClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      window.location.href = `/store/${product.id}`;
    },
    [product.id]
  );

  const processedDescription = useMemo(() => {
    if (!product.short_description) return "";

    const cleanDescription = DOMPurify.sanitize(product.short_description, {
      FORBID_TAGS: ["style", "script"],
      FORBID_ATTR: ["style", "class", "onclick", "onload"],
    });

    const maxLength = viewMode === "list" ? 150 : 80;
    return truncateText(cleanDescription, maxLength);
  }, [product.short_description, viewMode]);

  if (viewMode === "list") {
    return (
      <div
        className="relative group cursor-pointer"
        onClick={handleProductClick}
      >
        {/* Card Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl rounded-3xl border border-gray-700/50 group-hover:border-cyan-400/50 transition-all duration-500"></div>

        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500"></div>

        <div className="relative flex flex-col md:flex-row overflow-hidden rounded-3xl">
          <div className="relative md:w-80 h-64 md:h-auto overflow-hidden">
            <Image
              src={imageUrl || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              onError={() => setImageError(true)}
              sizes="(max-width: 768px) 100vw, 320px"
              loading="lazy"
            />

            <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
              {product.featured && (
                <span className="bg-gradient-to-r from-cyan-400 to-purple-500 text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-lg">
                  Destaque
                </span>
              )}
              {product.on_sale && discountPercentage > 0 && (
                <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-lg">
                  -{discountPercentage}%
                </span>
              )}
            </div>

            {product.type === "variable" && (
              <div className="absolute bottom-4 left-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 py-1.5 rounded-full text-xs font-medium pointer-events-none shadow-lg">
                <Package size={12} className="inline mr-1.5" />
                Variações
              </div>
            )}

            <div className="absolute bottom-4 right-4 pointer-events-none">
              <span
                className={`px-3 py-1.5 rounded-full text-xs font-medium shadow-lg ${
                  product.stock_status === "instock"
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                    : "bg-gradient-to-r from-red-500 to-pink-500 text-white"
                }`}
              >
                {product.stock_status === "instock"
                  ? "Em estoque"
                  : "Fora de estoque"}
              </span>
            </div>
          </div>

          <div className="flex-1 p-8">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all line-clamp-2">
                {product.name}
              </h3>
            </div>

            {processedDescription && (
              <p className="text-gray-300 mb-6 text-sm leading-relaxed">
                {processedDescription}
              </p>
            )}

            <div className="flex justify-between items-center mt-auto">
              <div>
                {product.on_sale ? (
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                      R$ {product.sale_price}
                    </span>
                    <span className="text-lg text-gray-500 line-through">
                      R$ {product.regular_price}
                    </span>
                  </div>
                ) : (
                  <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    R$ {product.price}
                  </div>
                )}
              </div>

              {product.categories && product.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 pointer-events-none">
                  {product.categories
                    .slice(0, 2)
                    .map((category: any, index: number) => (
                      <span
                        key={index}
                        className="bg-gray-800/50 text-gray-300 px-3 py-1.5 rounded-full text-xs border border-gray-600/50"
                      >
                        {category.name}
                      </span>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative group cursor-pointer h-full"
      onClick={handleProductClick}
    >
      {/* Card Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl rounded-3xl border border-gray-700/50 group-hover:border-cyan-400/50 transition-all duration-500"></div>

      {/* Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500"></div>

      <div className="relative h-full flex flex-col overflow-hidden rounded-3xl">
        {/* Image */}
        <div className="relative h-64 overflow-hidden">
          <Image
            alt={product.name}
            src={imageUrl || "/placeholder.svg"}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            onError={() => setImageError(true)}
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            loading="lazy"
          />

          <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
            {product.featured && (
              <span className="bg-gradient-to-r from-cyan-400 to-purple-500 text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-lg">
                Destaque
              </span>
            )}
            {product.on_sale && discountPercentage > 0 && (
              <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-lg">
                -{discountPercentage}%
              </span>
            )}
          </div>

          {product.type === "variable" && (
            <div className="absolute bottom-4 left-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 py-1.5 rounded-full text-xs font-medium pointer-events-none shadow-lg">
              <Package size={12} className="inline mr-1.5" />
              Variações
            </div>
          )}

          <div className="absolute bottom-4 right-4 pointer-events-none">
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-medium shadow-lg ${
                product.stock_status === "instock"
                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                  : "bg-gradient-to-r from-red-500 to-pink-500 text-white"
              }`}
            >
              {product.stock_status === "instock"
                ? "Disponível"
                : "Indisponível"}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col p-6">
          <h3 className="text-lg font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all mb-3 line-clamp-2">
            {product.name}
          </h3>

          {processedDescription && (
            <p className="text-gray-300 text-sm mb-4 leading-relaxed line-clamp-3 flex-1">
              {processedDescription}
            </p>
          )}

          <div className="flex justify-between items-end mt-auto">
            <div>
              {product.on_sale ? (
                <div className="flex flex-col">
                  <span className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    R$ {product.sale_price}
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    R$ {product.regular_price}
                  </span>
                </div>
              ) : (
                <div className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  R$ {product.price}
                </div>
              )}
            </div>

            {product.categories && product.categories.length > 0 && (
              <div className="text-right pointer-events-none">
                <span className="bg-gray-800/50 text-gray-300 px-3 py-1.5 rounded-full text-xs border border-gray-600/50">
                  {product.categories[0].name}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
