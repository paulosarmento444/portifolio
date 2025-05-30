"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import type { Product } from "@/models";

interface ProductGalleryProps {
  product: Product;
  variations: Product[];
  selectedColor: string;
  selectedSize: string;
}

export function ProductGallery({
  product,
  variations,
  selectedColor,
  selectedSize,
}: ProductGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  // Get images based on selected variation or main product
  const getImages = () => {
    if (product.type === "variable" && selectedColor && selectedSize) {
      const selectedVariation = variations.find((variation) =>
        variation.attributes.every(
          (attr) =>
            (attr.name === "Cor" && attr.option === selectedColor) ||
            (attr.name === "Tamanho" && attr.option === selectedSize)
        )
      );
    }
    return product.images;
  };

  const images = getImages();
  const currentImage = images[currentImageIndex];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="space-y-6">
      {/* Main Image */}
      <motion.div
        className="relative group"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>

        {/* Image Container */}
        <div className="relative bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl rounded-3xl p-4 border border-gray-700/50 group-hover:border-cyan-400/50 transition-all duration-500">
          <div className="relative aspect-square overflow-hidden rounded-2xl">
            <Image
              src={currentImage?.src || "/placeholder.svg?height=600&width=600"}
              alt={currentImage?.alt || product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              priority
            />

            {/* Zoom Button */}
            <button
              onClick={() => setIsZoomed(true)}
              className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-sm rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/70"
            >
              <ZoomIn size={20} />
            </button>

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 backdrop-blur-sm rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/70"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 backdrop-blur-sm rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/70"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute -top-4 -right-4 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-2xl p-3 animate-float">
          <div className="w-6 h-6 bg-white rounded-lg"></div>
        </div>
        <div className="absolute -bottom-4 -left-4 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl p-3 animate-float delay-1000">
          <div className="w-6 h-6 bg-white rounded-lg"></div>
        </div>
      </motion.div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <motion.div
          className="grid grid-cols-4 gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                index === currentImageIndex
                  ? "border-cyan-400 ring-2 ring-cyan-400/30"
                  : "border-gray-700 hover:border-gray-600"
              }`}
            >
              <Image
                src={image.src || "/placeholder.svg?height=150&width=150"}
                alt={image.alt || `${product.name} ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </motion.div>
      )}

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-10px) rotate(3deg);
          }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
