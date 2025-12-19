import { useState, useEffect } from 'react';

/**
 * Hook to track window dimensions
 * Replacement for react-use's useWindowSize
 *
 * @returns Object with width and height properties
 *
 * @example
 * ```tsx
 * const { width, height } = useWindowSize();
 * console.log(`Window size: ${width}x${height}`);
 * ```
 */
export function useWindowSize() {
  const [size, setSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    // Handle SSR - window may not be defined
    if (typeof window === 'undefined') {
      return;
    }

    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Set initial size
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return size;
}
