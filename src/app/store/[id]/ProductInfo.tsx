import React, { useState, useEffect, useCallback } from "react";
import { Box, Typography } from "@mui/material";
import { Product } from "@/models";
import { Button } from "@/app/components/button/FormButton";
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

  return (
    <Box>
      <Typography variant="h4" color="inherit">
        {product.name}
      </Typography>
      <Typography variant="h6" color="inherit">
        {product.price ? `R$${product.price}` : "Preço não disponível"}
      </Typography>
      {product.type === "variable" && (
        <>
          <Box my={2}>
            <Typography variant="body1" color="inherit">
              Cor
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
              {colorOptions.map((color) => (
                <Button
                  key={color}
                  variant={selectedColor === color ? "primary" : "secondary"}
                  onClick={() => handleColorChange(color)}
                >
                  {color}
                </Button>
              ))}
            </Box>
          </Box>

          <Box my={2}>
            <Typography variant="body1" color="inherit">
              Tamanho
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
              {sizeOptions.map((size) => (
                <Button
                  key={size}
                  variant={selectedSize === size ? "primary" : "secondary"}
                  onClick={() => handleSizeChange(size)}
                >
                  {size}
                </Button>
              ))}
            </Box>
          </Box>
        </>
      )}
      <Box mt={2}>
        <Typography
          variant="body1"
          sx={{ color: stockStatus === "Em estoque" ? "green" : "red" }}
        >
          {stockStatus === "Em estoque" ? "Disponível" : "Indisponível"}
        </Typography>
        {stockQuantity !== null && (
          <Typography variant="body2" color="inherit">
            Quantidade em estoque: {stockQuantity}
          </Typography>
        )}
      </Box>
      <Box mt={2}>
        <ProductQuantityForm
          product={productVariable}
          stockQuantity={stockQuantity}
        />
      </Box>
    </Box>
  );
};
