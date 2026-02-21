import { Asset } from 'expo-asset';

/**
 * Global cache for preloaded assets
 * Shared between useImagePreloader and useImagesArray
 * to ensure efficient caching and prevent redundant downloads
 */
export const globalAssetCache = new Map<number, Asset>();

/**
 * Get or create an asset from the cache
 */
export const getOrCreateAsset = (page: number, imageModule: any): Asset => {
  let asset = globalAssetCache.get(page);
  if (!asset) {
    console.log(`[AssetCache] 🔨 Creating new asset for page ${page}`);
    asset = Asset.fromModule(imageModule);
    globalAssetCache.set(page, asset);
  } else {
    console.log(`[AssetCache] ♻️ Reusing cached asset for page ${page} (downloaded: ${asset.downloaded})`);
  }
  return asset;
};

/**
 * Clear old assets from cache, keeping only specified pages
 */
export const cleanupAssetCache = (pagesToKeep: Set<number>) => {
  const keysToDelete: number[] = [];
  globalAssetCache.forEach((_, page) => {
    if (!pagesToKeep.has(page)) {
      keysToDelete.push(page);
    }
  });
  if (keysToDelete.length > 0) {
    console.log(`[AssetCache] 🗑️ Cleaning up ${keysToDelete.length} cached pages: ${keysToDelete.join(', ')}`);
    keysToDelete.forEach((key) => globalAssetCache.delete(key));
  }
  console.log(`[AssetCache] 📊 Cache size: ${globalAssetCache.size} pages`);
};
