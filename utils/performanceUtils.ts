import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';

// Debounce hook for search and input optimization
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Throttle hook for scroll and gesture optimization
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const lastRun = useRef(Date.now());

  return useCallback(
    ((...args) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = Date.now();
      }
    }) as T,
    [callback, delay]
  );
};

// Memoized selector for complex state calculations
export const useMemoizedSelector = <T, R>(
  data: T,
  selector: (data: T) => R,
  deps: React.DependencyList = []
): R => {
  return useMemo(() => selector(data), [data, ...deps]);
};

// Optimized list rendering with virtualization support
export const useOptimizedList = <T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) => {
  const [scrollOffset, setScrollOffset] = useState(0);
  
  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollOffset / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length - 1
    );
    
    return { startIndex, endIndex };
  }, [scrollOffset, itemHeight, containerHeight, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange]);

  const onScroll = useThrottle((event: any) => {
    setScrollOffset(event.nativeEvent.contentOffset.y);
  }, 16); // 60fps

  return {
    visibleItems,
    visibleRange,
    onScroll,
    totalHeight: items.length * itemHeight,
  };
};

// Performance monitoring hook
export const usePerformanceMonitor = (componentName: string) => {
  const renderCount = useRef(0);
  const startTime = useRef(Date.now());

  useEffect(() => {
    renderCount.current += 1;
    const renderTime = Date.now() - startTime.current;
    
    if (__DEV__) {
      console.log(`[Performance] ${componentName} - Render #${renderCount.current} took ${renderTime}ms`);
    }
    
    startTime.current = Date.now();
  });

  return {
    renderCount: renderCount.current,
  };
};

// Memory-efficient image loading
export const useOptimizedImage = (uri: string, placeholder?: string) => {
  const [imageUri, setImageUri] = useState(placeholder || '');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!uri) return;

    setIsLoading(true);
    setHasError(false);

    // Preload image
    const image = new Image();
    image.onload = () => {
      setImageUri(uri);
      setIsLoading(false);
    };
    image.onerror = () => {
      setHasError(true);
      setIsLoading(false);
      if (placeholder) {
        setImageUri(placeholder);
      }
    };
    image.src = uri;

    return () => {
      image.onload = null;
      image.onerror = null;
    };
  }, [uri, placeholder]);

  return { imageUri, isLoading, hasError };
};

// Batch state updates for better performance
export const useBatchedUpdates = <T>(initialState: T) => {
  const [state, setState] = useState(initialState);
  const pendingUpdates = useRef<Partial<T>[]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const batchUpdate = useCallback((update: Partial<T>) => {
    pendingUpdates.current.push(update);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setState(prevState => {
        const updates = pendingUpdates.current;
        pendingUpdates.current = [];
        
        return updates.reduce((acc, update) => ({ ...acc, ...update }), prevState) as T;
      });
    }, 0);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [state, batchUpdate] as const;
};

// Optimized async operation hook
export const useOptimizedAsync = <T, E = Error>(
  asyncFunction: () => Promise<T>,
  dependencies: React.DependencyList = []
) => {
  const [state, setState] = useState<{
    data: T | null;
    loading: boolean;
    error: E | null;
  }>({
    data: null,
    loading: true,
    error: null,
  });

  const cancelRef = useRef<boolean>(false);

  useEffect(() => {
    cancelRef.current = false;
    setState(prev => ({ ...prev, loading: true, error: null }));

    asyncFunction()
      .then(data => {
        if (!cancelRef.current) {
          setState({ data, loading: false, error: null });
        }
      })
      .catch(error => {
        if (!cancelRef.current) {
          setState({ data: null, loading: false, error });
        }
      });

    return () => {
      cancelRef.current = true;
    };
  }, dependencies);

  return state;
};

