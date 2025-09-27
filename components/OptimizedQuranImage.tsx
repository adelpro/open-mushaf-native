import React, { memo, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';

import { Image, ImageContentFit } from 'expo-image';

import useAdvancedImageCache from '@/hooks/useAdvancedImageCache';
import { useColors } from '@/hooks/useColors';
import useImagesArray from '@/hooks/useImagesArray';

import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface OptimizedQuranImageProps {
  page: number;
  style?: any;
  contentFit?: ImageContentFit;
  onLoad?: () => void;
  onError?: (error: any) => void;
  enableBlur?: boolean;
  blurRadius?: number;
}

/**
 * Optimized Quran page image component with advanced caching,
 * progressive loading, and performance optimizations
 */
const OptimizedQuranImage = memo(function OptimizedQuranImage({
  page,
  style,
  contentFit = 'fill',
  onLoad,
  onError,
  enableBlur = false,
  blurRadius = 0,
}: OptimizedQuranImageProps) {
  'use memo';

  const colorScheme = useColorScheme();
  const { tintColor, ivoryColor } = useColors();
  const { getCachedAsset, cacheStats } = useAdvancedImageCache(page);
  const { asset } = useImagesArray(page);

  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // Check cache first, fallback to regular asset
  const cachedAsset = getCachedAsset(page);
  const imageSource = cachedAsset?.localUri || asset?.localUri;

  useEffect(() => {
    if (imageSource) {
      setImageLoaded(true);
      setImageError(null);
    }
  }, [imageSource]);

  const handleLoad = () => {
    setImageLoaded(true);
    setImageError(null);
    onLoad?.();
  };

  const handleError = (error: any) => {
    setImageError('Failed to load image');
    setImageLoaded(false);
    onError?.(error);
  };

  // Show loading indicator while image is loading
  if (!imageSource && !imageError) {
    return (
      <ThemedView style={[styles.loadingContainer, style]}>
        <ActivityIndicator size="large" color={tintColor} />
      </ThemedView>
    );
  }

  // Show error state
  if (imageError) {
    return (
      <ThemedView
        style={[styles.errorContainer, style, { backgroundColor: ivoryColor }]}
      >
        <ThemedText style={styles.errorText}>
          Failed to load page {page}
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <Image
      source={{ uri: imageSource }}
      style={[
        style,
        colorScheme === 'dark' &&
          enableBlur && {
            opacity: 1 - (blurRadius || 0),
          },
      ]}
      contentFit={contentFit}
      onLoad={handleLoad}
      onError={handleError}
      // Expo Image caching configuration
      cachePolicy="memory-disk"
      priority="high"
      // Progressive loading support
      placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
      transition={200}
      // Accessibility
      accessible={true}
      accessibilityLabel={`Quran page ${page}`}
      accessibilityRole="image"
    />
  );
});

// Add display name for debugging
OptimizedQuranImage.displayName = 'OptimizedQuranImage';

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
});

export default OptimizedQuranImage;
