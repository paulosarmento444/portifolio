import React, { useState, useCallback } from "react";
import { Box, IconButton, Tooltip } from "@mui/material";
import Image from "next/legacy/image";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import { useTheme } from "@mui/material/styles";
import { Product } from "@/models";

interface ProductGalleryProps {
  product: Product;
  variations: Product[];
  selectedColor: string;
  selectedSize: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({
  product,
  variations,
  selectedColor,
  selectedSize,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const theme = useTheme();

  const filterImages = useCallback(() => {
    if (product?.type === "variable") {
      const selectedVariation = variations.find((variation) =>
        variation.attributes.every(
          (attr) =>
            (attr.name === "Cor" && attr.option === selectedColor) ||
            (attr.name === "Tamanho" && attr.option === selectedSize)
        )
      );
      return [
        ...(selectedVariation?.image ? [selectedVariation.image] : []),
        ...(product.images || []),
      ];
    }
    return product?.images || [];
  }, [product, variations, selectedColor, selectedSize]);

  const currentImages = filterImages();

  const handleImageChange = (direction: "next" | "prev") => {
    setCurrentImageIndex((prevIndex) =>
      direction === "next"
        ? (prevIndex + 1) % currentImages.length
        : (prevIndex - 1 + currentImages.length) % currentImages.length
    );
  };

  return (
    <Box position="relative" sx={{ height: "500px" }}>
      <Box position="relative" width="100%" height="100%" overflow="hidden">
        <Image
          src={currentImages[currentImageIndex]?.src || ""}
          alt={product.name}
          layout="fill"
          objectFit="contain"
          style={{
            borderRadius: "8px",
            border: `1px solid ${theme.palette.divider}`,
          }}
        />
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 2,
            py: 1,
          }}
        >
          <IconButton onClick={() => handleImageChange("prev")}>
            <ArrowBackIosIcon sx={{ color: "white" }} />
          </IconButton>
          <IconButton onClick={() => handleImageChange("next")}>
            <ArrowForwardIosIcon sx={{ color: "white" }} />
          </IconButton>
        </Box>
        <Box
          position="absolute"
          bottom="0"
          sx={{
            display: "flex",
            gap: 1,
            overflowX: "auto",
            mb: 2,
            maxWidth: "calc(100% - 40px)",
            whiteSpace: "nowrap",
            padding: "0 10px",
          }}
        >
          {currentImages.map((image, index) => (
            <Tooltip key={index} title={`Imagem ${index + 1}`} arrow>
              <IconButton
                onClick={() => setCurrentImageIndex(index)}
                sx={{
                  borderRadius: "4px",
                  border:
                    index === currentImageIndex
                      ? `2px solid ${theme.palette.primary.main}`
                      : "2px solid transparent",
                  boxShadow:
                    index === currentImageIndex
                      ? `0 0 5px ${theme.palette.primary.main}`
                      : "none",
                  p: 0,
                  transition: "border 0.3s ease, box-shadow 0.3s ease",
                  "&:hover": {
                    border: `2px solid ${theme.palette.primary.main}`,
                  },
                }}
              >
                <Image
                  src={image.src}
                  alt={`Thumbnail ${index + 1}`}
                  width={80}
                  height={80}
                  style={{ objectFit: "cover", borderRadius: "4px" }}
                />
              </IconButton>
            </Tooltip>
          ))}
        </Box>
      </Box>
    </Box>
  );
};
