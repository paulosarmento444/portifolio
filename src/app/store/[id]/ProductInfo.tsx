"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Star, Heart, Share2, Package, Truck, Shield } from "lucide-react";
import type { Product } from "@/models";
import { getProduct } from "@/app/service/ProductService";
import { ProductQuantityForm } from "@/app/components/product/ProductQuantityForm";

interface ProductInfoProps {
  product: Product;
  variations: Product[];
  setSelectedColor: (color: string) => void;
  setSelectedSize: (size: string) => void;
}

export const ProductInfo: React.FC<ProductInfoProps> = ({
  product,
  variations,
  setSelectedColor,
  setSelectedSize,
}) => {
  const [selectedColor, setSelectedColorState] = useState<string>("");
  const [selectedSize, setSelectedSizeState] = useState<string>("");
  const [stockQuantity, setStockQuantity] = useState<number | null>(null);
  const [stockStatus, setStockStatus] = useState<string>("");
  const [variableId, setVariableId] = useState<number | null>(null);
  const [productVariable, setProductVariable] = useState<Product>(product);
  const [isFavorite, setIsFavorite] = useState(false);

  // Calcular preço com desconto
  const discountPercentage =
    productVariable.on_sale &&
    productVariable.regular_price &&
    productVariable.sale_price
      ? Math.round(
          ((Number.parseFloat(productVariable.regular_price) -
            Number.parseFloat(productVariable.sale_price)) /
            Number.parseFloat(productVariable.regular_price)) *
            100
        )
      : 0;

  const handleColorChange = (color: string) => {
    setSelectedColorState(color);
    setSelectedColor(color);
  };

  const handleSizeChange = (size: string) => {
    setSelectedSizeState(size);
    setSelectedSize(size);
  };

  useEffect(() => {
    const defaultColor =
      product.attributes.find((attr: any) => attr.name === "Cor")?.options[0] ||
      "";
    const defaultSize =
      product.attributes.find((attr: any) => attr.name === "Tamanho")
        ?.options[0] || "";
    setSelectedColorState(defaultColor);
    setSelectedSizeState(defaultSize);
    setSelectedColor(defaultColor);
    setSelectedSize(defaultSize);
  }, [product, setSelectedColor, setSelectedSize]);

  const updateStock = useCallback(async () => {
    let stock = 0;
    let status = "Sem estoque";
    let productId = product.id;

    if (product.type === "variable") {
      const selectedVariation = variations.find((variation) =>
        variation.attributes.every(
          (attr) =>
            (attr.name === "Cor" && attr.option === selectedColor) ||
            (attr.name === "Tamanho" && attr.option === selectedSize)
        )
      );
      if (selectedVariation) {
        stock = selectedVariation.stock_quantity;
        productId = selectedVariation.id;
        status = stock > 0 ? "Em estoque" : "Sem estoque";
        const productData = await getProduct(+selectedVariation.id);
        setProductVariable(productData);
        setVariableId(+selectedVariation.id);
      }
    } else if (product.manage_stock) {
      stock = product.stock_quantity;
      status = stock > 0 ? "Em estoque" : "Sem estoque";
      setProductVariable(product);
    }

    setStockQuantity(stock);
    setStockStatus(status);
  }, [product, variations, selectedColor, selectedSize]);

  useEffect(() => {
    updateStock();
  }, [updateStock]);

  const colorOptions =
    product.attributes.find((attr) => attr.name === "Cor")?.options || [];
  const sizeOptions =
    product.attributes.find((attr) => attr.name === "Tamanho")?.options || [];

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.short_description,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Erro ao compartilhar:", error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const isOutOfStock = stockStatus !== "Em estoque";

  return (
    <div className="space-y-6">
      {/* Título e Ações */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {product.name}
            </h1>
          </div>

          {/* Ações */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className={`p-2 rounded-lg transition-colors ${
                isFavorite
                  ? "bg-red-500 text-white"
                  : "bg-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              <Heart size={20} className={isFavorite ? "fill-current" : ""} />
            </button>
            <button
              onClick={handleShare}
              className="p-2 bg-gray-800 text-gray-400 hover:text-white rounded-lg transition-colors"
            >
              <Share2 size={20} />
            </button>
          </div>
        </div>

        {/* Preço */}
        <div className="flex items-center gap-4 mb-6">
          {productVariable.on_sale ? (
            <>
              <span className="text-3xl font-bold text-lime-400">
                R$ {productVariable.sale_price}
              </span>
              <span className="text-xl text-gray-500 line-through">
                R$ {productVariable.regular_price}
              </span>
              {discountPercentage > 0 && (
                <span className="bg-red-500 text-white px-2 py-1 rounded-full text-sm font-medium">
                  -{discountPercentage}%
                </span>
              )}
            </>
          ) : (
            <span className="text-3xl font-bold text-lime-400">
              R$ {productVariable.price || "Preço não disponível"}
            </span>
          )}
        </div>

        {/* Status e Badges */}
        <div className="flex items-center gap-2 mb-6">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              isOutOfStock ? "bg-red-500 text-white" : "bg-green-500 text-white"
            }`}
          >
            {stockStatus === "Em estoque" ? "Disponível" : "Indisponível"}
          </span>

          {stockQuantity !== null && stockQuantity > 0 && (
            <span className="text-gray-400 text-sm">
              Estoque: {stockQuantity} unidades
            </span>
          )}

          {product.featured && (
            <span className="bg-lime-500 text-gray-900 px-3 py-1 rounded-full text-sm font-medium">
              Destaque
            </span>
          )}

          {product.type === "variable" && (
            <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              <Package size={12} className="inline mr-1" />
              Variações
            </span>
          )}
        </div>
      </motion.div>

      {/* Variações */}
      {product.type === "variable" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6"
        >
          {/* Cores */}
          {colorOptions.length > 0 && (
            <div>
              <h3 className="text-white font-medium mb-3">Cor:</h3>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorChange(color)}
                    className={`px-4 py-2 rounded-lg border-2 transition-all duration-200 ${
                      selectedColor === color
                        ? "border-lime-500 bg-lime-500 text-gray-900 font-medium"
                        : "border-gray-600 text-gray-300 hover:border-lime-500 hover:text-lime-400"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tamanhos */}
          {sizeOptions.length > 0 && (
            <div>
              <h3 className="text-white font-medium mb-3">Tamanho:</h3>
              <div className="flex flex-wrap gap-2">
                {sizeOptions.map((size) => (
                  <button
                    key={size}
                    onClick={() => handleSizeChange(size)}
                    className={`px-4 py-2 rounded-lg border-2 transition-all duration-200 ${
                      selectedSize === size
                        ? "border-lime-500 bg-lime-500 text-gray-900 font-medium"
                        : "border-gray-600 text-gray-300 hover:border-lime-500 hover:text-lime-400"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Formulário de Quantidade com seu botão de carrinho */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <ProductQuantityForm
          product={productVariable}
          stockQuantity={stockQuantity}
        />
      </motion.div>

      {/* Informações de Entrega */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-gray-800 rounded-xl p-4 border border-gray-700"
      >
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-gray-300">
            <Truck size={20} className="text-lime-400" />
            <span>Frete grátis para compras acima de R$ 99</span>
          </div>
          <div className="flex items-center gap-3 text-gray-300">
            <Shield size={20} className="text-lime-400" />
            <span>Garantia de 30 dias</span>
          </div>
          <div className="flex items-center gap-3 text-gray-300">
            <Package size={20} className="text-lime-400" />
            <span>Entrega em até 7 dias úteis</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
