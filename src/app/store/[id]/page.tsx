"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import Header from "@/app/components/Header";
import { getProduct, getProductVariation } from "@/app/service/ProductService";
import { Product } from "@/models";
import { ProductInfo } from "./ProductInfo";
import Grid2 from "@mui/material/Unstable_Grid2";
import { ProductGallery } from "@/app/components/product/ProductGallery";

export default function ProductDetailPage({
  params: { id },
}: Readonly<{
  params: { id: string };
}>) {
  const [product, setProduct] = useState<Product | null>(null);
  const [variations, setVariations] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");

  const fetchProductData = useCallback(async () => {
    try {
      setLoading(true);
      const productData = await getProduct(Number(id));
      setProduct(productData);

      if (productData.type === "variable") {
        const variationsData = await getProductVariation(Number(id));
        setVariations(variationsData);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProductData();
  }, [fetchProductData]);

  if (loading) {
    return (
      <>
        <Header />
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <CircularProgress />
        </Box>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Header />
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <Typography variant="h6" color="white">
            Produto não encontrado.
          </Typography>
        </Box>
      </>
    );
  }

  return (
    <Box>
      <Header />
      <Box mt={20} px={2}>
        <Grid2 container spacing={8}>
          <Grid2 xs={12} md={6}>
            <ProductGallery
              product={product}
              variations={variations}
              selectedColor={selectedColor}
              selectedSize={selectedSize}
            />
          </Grid2>
          <Grid2 xs={12} md={6}>
            <ProductInfo
              product={product}
              variations={variations}
              setSelectedColor={setSelectedColor}
              setSelectedSize={setSelectedSize}
            />
          </Grid2>
          {/* <ProductTabs product={product} /> */}
        </Grid2>
      </Box>
    </Box>
  );
}
