import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';

import { Asset } from 'expo-asset';
import { useAtomValue } from 'jotai/react';

import { imagesMapHafs, imagesMapWarsh } from '@/constants';
import { mushafRiwaya } from '@/jotai/atoms';

import useOptimizedQuranMetadata from './useOptimizedQuranMetadata';

interface CacheEntry {
  page: number;
  asset: Asset;
  lastAccessed: number;
  downloadTime: number;
  priority: 'high' | 'medium' | 'low';
}

interface CacheConfig {
  maxCacheSize: number;
  preloadRadius: number;
  aggressivePreload: boolean;
  enablePredictiveLoading: boolean;
  cachePersistence: boolean;
}

/**
 * Advanced image caching system for Quran pages with intelligent preloading,
 * memory management, and performance optimizations
 */
export default function useAdvancedImageCache(
  currentPage: number,
  config?: Partial<CacheConfig>,
) {
  const mushafRiwayaValue = useAtomValue(mushafRiwaya);
  const { specsData } = useOptimizedQuranMetadata();
  const { defaultNumberOfPages } = specsData;

  // Cache configuration with defaults
  const cacheConfig: CacheConfig = {
    maxCacheSize: Platform.OS === 'ios' ? 12 : 8, // iOS can handle more cache
    preloadRadius: 3, // Preload 3 pages ahead/behind
    aggressivePreload: Platform.OS === 'ios', // More aggressive on iOS
    enablePredictiveLoading: true,
    cachePersistence: true,
    ...config,
  };

  // Cache state
  const cacheRef = useRef<Map<number, CacheEntry>>(new Map());
  const preloadQueueRef = useRef<Set<number>>(new Set());
  const navigationHistoryRef = useRef<number[]>([]);
  const [cacheStats, setCacheStats] = useState({
    size: 0,
    hitRate: 0,
    missCount: 0,
    hitCount: 0,
  });

  // Memory management
  const handleMemoryWarning = useCallback(() => {
    console.log('Memory warning - purging image cache');
    const currentCache = cacheRef.current;
    const criticalPages = new Set([
      currentPage,
      Math.max(currentPage - 1, 1),
      Math.min(currentPage + 1, defaultNumberOfPages),
    ]);

    // Keep only critical pages during memory pressure
    for (const [page, entry] of currentCache.entries()) {
      if (!criticalPages.has(page)) {
        currentCache.delete(page);
      }
    }

    // Update cache size without loops
    setCacheStats((prev) => ({
      ...prev,
      size: currentCache.size,
    }));
  }, [currentPage, defaultNumberOfPages]);

  // Intelligent cache eviction based on LRU + priority
  const evictLeastUsefulEntries = useCallback(
    (targetSize: number) => {
      const currentCache = cacheRef.current;
      const entries = Array.from(currentCache.entries());

      // Sort by usefulness score (combines recency, priority, and distance from current page)
      entries.sort(([pageA, entryA], [pageB, entryB]) => {
        const distanceA = Math.abs(pageA - currentPage);
        const distanceB = Math.abs(pageB - currentPage);
        const priorityScoreA =
          entryA.priority === 'high' ? 3 : entryA.priority === 'medium' ? 2 : 1;
        const priorityScoreB =
          entryB.priority === 'high' ? 3 : entryB.priority === 'medium' ? 2 : 1;
        const recencyA = Date.now() - entryA.lastAccessed;
        const recencyB = Date.now() - entryB.lastAccessed;

        // Composite usefulness score (lower is less useful)
        const usefulnessA =
          priorityScoreA * 1000 - distanceA * 10 - recencyA / 1000;
        const usefulnessB =
          priorityScoreB * 1000 - distanceB * 10 - recencyB / 1000;

        return usefulnessA - usefulnessB;
      });

      // Remove least useful entries
      const entriesToRemove = entries.slice(
        0,
        Math.max(0, entries.length - targetSize),
      );
      entriesToRemove.forEach(([page]) => {
        currentCache.delete(page);
      });

      // Update cache size directly without triggering loops
      setCacheStats((prev) => ({
        ...prev,
        size: currentCache.size,
      }));
    },
    [currentPage],
  );

  // Update cache statistics
  const updateCacheStats = useCallback(() => {
    const cache = cacheRef.current;
    const newSize = cache.size;

    setCacheStats((prev) => {
      const totalRequests = prev.hitCount + prev.missCount;
      const newHitRate = totalRequests > 0 ? prev.hitCount / totalRequests : 0;

      // Only update if values actually changed to prevent infinite loops
      if (
        prev.size !== newSize ||
        Math.abs(prev.hitRate - newHitRate) > 0.001
      ) {
        return {
          ...prev,
          size: newSize,
          hitRate: newHitRate,
        };
      }
      return prev;
    });
  }, []);

  // Predictive loading based on navigation patterns
  const getPredictivePages = useCallback((): number[] => {
    if (!cacheConfig.enablePredictiveLoading) return [];

    const history = navigationHistoryRef.current;
    if (history.length < 3) return [];

    // Simple pattern detection - if user is going forward/backward consistently
    const last3 = history.slice(-3);
    const isForward = last3.every((page, i) => i === 0 || page > last3[i - 1]);
    const isBackward = last3.every((page, i) => i === 0 || page < last3[i - 1]);

    if (isForward) {
      // User going forward - preload more pages ahead
      return Array.from({ length: cacheConfig.preloadRadius }, (_, i) =>
        Math.min(currentPage + i + 3, defaultNumberOfPages),
      );
    } else if (isBackward) {
      // User going backward - preload more pages behind
      return Array.from({ length: cacheConfig.preloadRadius }, (_, i) =>
        Math.max(currentPage - i - 3, 1),
      );
    }

    return [];
  }, [currentPage, defaultNumberOfPages, cacheConfig]);

  // Intelligent page priority calculation
  const getPagePriority = useCallback(
    (page: number): 'high' | 'medium' | 'low' => {
      const distance = Math.abs(page - currentPage);

      if (page === currentPage) return 'high';
      if (distance === 1) return 'high';
      if (distance <= 2) return 'medium';
      return 'low';
    },
    [currentPage],
  );

  // Enhanced preload function
  const preloadPages = useCallback(
    async (pages: number[], priority: 'high' | 'medium' | 'low' = 'medium') => {
      if (mushafRiwayaValue === undefined) return;

      const imagesMap =
        mushafRiwayaValue === 'hafs' ? imagesMapHafs : imagesMapWarsh;
      if (!imagesMap) return;

      const currentCache = cacheRef.current;
      const validPages = pages.filter(
        (page) =>
          page >= 1 &&
          page <= defaultNumberOfPages &&
          !currentCache.has(page) &&
          !preloadQueueRef.current.has(page),
      );

      if (validPages.length === 0) return;

      // Add to preload queue
      validPages.forEach((page) => preloadQueueRef.current.add(page));

      try {
        // Load assets with priority-based batching
        const startTime = Date.now();
        const assetsToLoad = validPages
          .map((page) => ({ page, asset: Asset.fromModule(imagesMap[page]) }))
          .filter(({ asset }) => asset && !asset.downloaded);

        // Process high priority pages first
        const highPriorityAssets = assetsToLoad.filter(
          ({ page }) => getPagePriority(page) === 'high',
        );
        const otherAssets = assetsToLoad.filter(
          ({ page }) => getPagePriority(page) !== 'high',
        );

        // Load high priority assets first
        if (highPriorityAssets.length > 0) {
          await Promise.all(
            highPriorityAssets.map(async ({ page, asset }) => {
              if (!asset.downloaded) {
                await asset.downloadAsync();
              }

              // Add to cache
              currentCache.set(page, {
                page,
                asset,
                lastAccessed: Date.now(),
                downloadTime: Date.now() - startTime,
                priority: getPagePriority(page),
              });
            }),
          );
        }

        // Load other assets in background
        if (otherAssets.length > 0) {
          // Use setTimeout to avoid blocking the main thread
          setTimeout(async () => {
            try {
              await Promise.all(
                otherAssets.map(async ({ page, asset }) => {
                  if (!asset.downloaded) {
                    await asset.downloadAsync();
                  }

                  currentCache.set(page, {
                    page,
                    asset,
                    lastAccessed: Date.now(),
                    downloadTime: Date.now() - startTime,
                    priority: getPagePriority(page),
                  });
                }),
              );
            } catch (error) {
              console.error('Background preload error:', error);
            }
          }, 100);
        }

        // Manage cache size
        if (currentCache.size > cacheConfig.maxCacheSize) {
          evictLeastUsefulEntries(cacheConfig.maxCacheSize);
        }

        // Update hit count without frequent re-renders
        if (validPages.length > 0) {
          setCacheStats((prev) => ({
            ...prev,
            hitCount: prev.hitCount + validPages.length,
          }));
        }
      } catch (error) {
        console.error('Error in advanced preloading:', error);
        setCacheStats((prev) => ({
          ...prev,
          missCount: prev.missCount + validPages.length,
        }));
      } finally {
        // Remove from preload queue
        validPages.forEach((page) => preloadQueueRef.current.delete(page));
        // Don't call updateCacheStats here to prevent loops
      }
    },
    [
      mushafRiwayaValue,
      defaultNumberOfPages,
      cacheConfig,
      evictLeastUsefulEntries,
      getPagePriority,
    ],
  );

  // Main preloading effect
  useEffect(() => {
    if (!currentPage || currentPage < 1) return;

    // Update navigation history for predictive loading
    navigationHistoryRef.current.push(currentPage);
    if (navigationHistoryRef.current.length > 10) {
      navigationHistoryRef.current.shift(); // Keep only last 10 pages
    }

    // Calculate pages to preload
    const basicPages = [
      currentPage,
      Math.max(currentPage - 1, 1),
      Math.min(currentPage + 1, defaultNumberOfPages),
    ];

    const extendedPages = cacheConfig.aggressivePreload
      ? Array.from({ length: cacheConfig.preloadRadius * 2 }, (_, i) => {
          const offset = i - cacheConfig.preloadRadius;
          return Math.max(
            1,
            Math.min(currentPage + offset, defaultNumberOfPages),
          );
        })
      : [];

    const predictivePages = getPredictivePages();

    // Preload in order of priority
    preloadPages(basicPages, 'high');

    if (extendedPages.length > 0) {
      setTimeout(() => preloadPages(extendedPages, 'medium'), 50);
    }

    if (predictivePages.length > 0) {
      setTimeout(() => preloadPages(predictivePages, 'low'), 200);
    }
  }, [
    currentPage,
    defaultNumberOfPages,
    preloadPages,
    getPredictivePages,
    cacheConfig,
  ]);

  // Memory warning handling
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'background') {
        handleMemoryWarning();
      }
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );
    return () => subscription?.remove();
  }, [handleMemoryWarning]);

  // Cache access function for components
  const getCachedAsset = useCallback((page: number): Asset | null => {
    const entry = cacheRef.current.get(page);
    if (entry) {
      entry.lastAccessed = Date.now();
      // Update hit count without triggering re-renders
      setCacheStats((prev) => ({
        ...prev,
        hitCount: prev.hitCount + 1,
      }));
      return entry.asset;
    }

    // Update miss count without triggering re-renders
    setCacheStats((prev) => ({
      ...prev,
      missCount: prev.missCount + 1,
    }));
    return null;
  }, []);

  // Preload specific pages on demand
  const preloadSpecificPages = useCallback(
    (pages: number[]) => {
      preloadPages(pages, 'medium');
    },
    [preloadPages],
  );

  return {
    getCachedAsset,
    preloadSpecificPages,
    cacheStats,
    clearCache: () => {
      cacheRef.current.clear();
      setCacheStats({
        size: 0,
        hitRate: 0,
        missCount: 0,
        hitCount: 0,
      });
    },
  };
}
