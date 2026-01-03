import { useState } from "react";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";
import ImageSkeleton from "./ImageSkeleton";

interface LazyImageProps {
  src: string;
  thumbnailSrc?: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

export default function LazyImage({
  src,
  thumbnailSrc,
  alt,
  width,
  height,
  className = "",
  onClick,
  children,
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const { targetRef, hasIntersected } = useIntersectionObserver({
    rootMargin: "300px", // Start loading 300px before entering viewport
    threshold: 0.01,
  });

  const aspectRatio = width && height ? `${width} / ${height}` : "auto";
  const displaySrc = thumbnailSrc || src;

  return (
    <div
      ref={targetRef as React.RefObject<HTMLDivElement>}
      className="image-wrapper relative"
    >
      {/* Skeleton placeholder */}
      {!isLoaded && width && height && (
        <div className="absolute inset-0 z-0">
          <ImageSkeleton aspectRatio={aspectRatio} />
        </div>
      )}

      {/* Actual image - only load when in viewport */}
      {hasIntersected && (
        <img
          src={displaySrc}
          alt={alt}
          width={width}
          height={height}
          onClick={onClick}
          className={`cursor-pointer transition-opacity duration-300 relative z-10 ${className}`}
          style={{
            opacity: isLoaded ? "1" : "0",
            aspectRatio: aspectRatio,
          }}
          onLoad={() => setIsLoaded(true)}
          onError={() => setIsLoaded(true)} // Show broken image state
        />
      )}

      {/* Overlay content slot */}
      {children}
    </div>
  );
}
