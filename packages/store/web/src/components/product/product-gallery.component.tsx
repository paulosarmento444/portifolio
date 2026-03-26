"use client";

import { useEffect, useState, type MouseEvent as ReactMouseEvent } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { IconButton, MediaFrame, StatusBadge } from "@site/shared";
import type { StoreProductDetail, StoreProductVariation } from "../../data/store.types";
import { resolveGallery } from "../../data/store.utils";

interface ProductGalleryProps {
  product: StoreProductDetail;
  selectedVariation: StoreProductVariation | null;
}

export function ProductGallery({
  product,
  selectedVariation,
}: ProductGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [zoomState, setZoomState] = useState({ active: false, x: 50, y: 50 });
  const [failedSrc, setFailedSrc] = useState<Record<string, boolean>>({});

  const images = resolveGallery(product, selectedVariation);
  const safeImageIndex = Math.min(currentImageIndex, Math.max(images.length - 1, 0));
  const currentImage = images[safeImageIndex];
  const displayName = selectedVariation?.name || product.name;

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [selectedVariation?.id, product.id]);

  useEffect(() => {
    setZoomState({ active: false, x: 50, y: 50 });
  }, [safeImageIndex, product.id, selectedVariation?.id]);

  const getSafeSrc = (src?: string, fallbackSize = "640") => {
    if (!src || failedSrc[src]) {
      return `/placeholder.svg?height=${fallbackSize}&width=${fallbackSize}`;
    }
    return src;
  };

  const markFailed = (src?: string) => {
    if (!src) return;
    setFailedSrc((previous) =>
      previous[src] ? previous : { ...previous, [src]: true },
    );
  };

  const nextImage = () => {
    if (images.length <= 1) return;
    setCurrentImageIndex((previous) => (previous + 1) % images.length);
  };

  const prevImage = () => {
    if (images.length <= 1) return;
    setCurrentImageIndex(
      (previous) => (previous - 1 + images.length) % images.length,
    );
  };

  const handleMouseMove = (event: ReactMouseEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    if (bounds.width <= 0 || bounds.height <= 0) {
      return;
    }

    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;

    setZoomState({
      active: true,
      x: Math.min(100, Math.max(0, x)),
      y: Math.min(100, Math.max(0, y)),
    });
  };

  const handleZoomReset = () => {
    setZoomState((previous) =>
      previous.active ? { ...previous, active: false } : previous,
    );
  };

  return (
    <div className="site-stack-section">
      <MediaFrame
        aspect="square"
        padded
        className="shadow-[var(--site-shadow-md)]"
        contentClassName="relative flex h-full items-center justify-center"
      >
        <div
          data-testid="product-gallery-stage"
          className="group relative h-full w-full overflow-hidden rounded-[calc(var(--site-radius-xl)-0.25rem)] bg-[color:var(--site-color-surface-inset)]"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleZoomReset}
          onTouchStart={handleZoomReset}
        >
          <div
            data-testid="product-gallery-active-image"
            data-image-key={currentImage?.id ?? currentImage?.url ?? "placeholder"}
            data-zoom-active={zoomState.active ? "true" : "false"}
            className="absolute inset-0 transition-transform duration-200 ease-out will-change-transform"
            style={{
              transform: zoomState.active ? "scale(2.15)" : "scale(1)",
              transformOrigin: `${zoomState.x}% ${zoomState.y}%`,
            }}
          >
            <Image
              src={getSafeSrc(currentImage?.url, "900")}
              alt={currentImage?.alt || displayName}
              fill
              className="object-contain p-2 sm:p-3"
              priority
              onError={() => markFailed(currentImage?.url)}
              unoptimized
            />
          </div>

          <div className="absolute left-4 top-4">
            <StatusBadge tone="neutral">
              {safeImageIndex + 1} / {Math.max(images.length, 1)}
            </StatusBadge>
          </div>

          {images.length > 1 ? (
            <div className="absolute inset-x-4 bottom-4 flex items-center justify-between">
              <IconButton
                icon={<ChevronLeft className="h-4 w-4" />}
                label="Imagem anterior"
                variant="secondary"
                onClick={prevImage}
              />
              <IconButton
                icon={<ChevronRight className="h-4 w-4" />}
                label="Próxima imagem"
                variant="secondary"
                onClick={nextImage}
              />
            </div>
          ) : null}
        </div>
      </MediaFrame>

      {images.length > 1 ? (
        <div className="flex gap-3 overflow-x-auto pb-1 sm:grid sm:grid-cols-5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {images.map((image, index) => {
            const active = index === safeImageIndex;

            return (
              <button
                key={`${image.id ?? image.url}-${index}`}
                type="button"
                onClick={() => setCurrentImageIndex(index)}
                aria-label={`Selecionar imagem ${index + 1} de ${Math.max(images.length, 1)}`}
                aria-pressed={active}
                className={`shrink-0 overflow-hidden rounded-[var(--site-radius-lg)] border transition-all duration-200 sm:shrink-auto ${
                  active
                    ? "border-[color:var(--site-color-primary)] bg-[color:var(--site-color-primary-soft)] shadow-[var(--site-shadow-focus)]"
                    : "border-[color:var(--site-color-border)] hover:border-[color:var(--site-color-border-strong)]"
                }`}
              >
                <div className="relative aspect-square w-20 bg-[color:var(--site-color-surface-inset)] sm:w-auto">
                  <Image
                    src={getSafeSrc(image.url, "180")}
                    alt={image.alt || `${product.name} ${index + 1}`}
                    fill
                    className="object-contain p-2"
                    onError={() => markFailed(image.url)}
                    unoptimized
                  />
                </div>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
