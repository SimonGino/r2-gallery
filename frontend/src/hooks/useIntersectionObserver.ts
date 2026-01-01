import { useEffect, useRef, useState } from 'react';

interface UseIntersectionObserverOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
}

/**
 * Custom hook for intersection observer
 * Detects when an element enters the viewport
 */
export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const targetRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isVisible = entry.isIntersecting;
        setIsIntersecting(isVisible);

        // Once intersected, always keep it true
        if (isVisible && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      {
        root: options.root || null,
        rootMargin: options.rootMargin || '300px', // Load 300px before entering viewport
        threshold: options.threshold || 0.01,
      }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [options.root, options.rootMargin, options.threshold, hasIntersected]);

  return { targetRef, isIntersecting, hasIntersected };
}
