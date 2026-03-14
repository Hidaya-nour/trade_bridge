import React, { useEffect, useState } from "react";
import { Package } from "lucide-react";

import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images?: string[];
  name: string;
  maxThumbnails?: number;
  className?: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({
  images = [],
  name,
  maxThumbnails = 5,
  className,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    if (!images || images.length === 0) {
      setActiveImageIndex(0);
      return;
    }
    setActiveImageIndex((prev) =>
      Math.min(prev, Math.max(0, images.length - 1)),
    );
  }, [images]);

  const activeImage = images[activeImageIndex] || images[0];

  return (
    <div className={cn("space-y-3", className)}>
      <div className="aspect-square bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl flex items-center justify-center border overflow-hidden">
        {activeImage ? (
          <img
            src={activeImage}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Package className="h-32 w-32 text-primary/30" />
        )}
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
          {images.slice(0, maxThumbnails).map((url, index) => (
            <button
              key={`${url}-${index}`}
              type="button"
              onClick={() => setActiveImageIndex(index)}
              className={cn(
                "aspect-square w-full rounded-md border overflow-hidden",
                index === activeImageIndex
                  ? "ring-2 ring-primary border-primary"
                  : "border-muted",
              )}
            >
              <img
                src={url}
                alt={`${name} ${index + 1}`}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
