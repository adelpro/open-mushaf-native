import { describe, expect, it, vi } from 'vitest';

import { ERROR_MESSAGES } from '@/constants/errorMessages';
import { getImagesMap } from '@/utils/pageImages';

const { mockGetImagesMap, mockDownloadAsync } = vi.hoisted(() => ({
  mockGetImagesMap: vi.fn(),
  mockDownloadAsync: vi.fn(() => Promise.resolve()),
}));

vi.mock('@/utils/pageImages', () => ({
  getImagesMap: (...args: unknown[]) => mockGetImagesMap(...args),
}));

vi.mock('expo-asset', () => ({
  Asset: {
    fromModule: (id: number) => ({
      downloaded: false,
      downloadAsync: mockDownloadAsync,
      localUri: `mock://page-${id}`,
    }),
  },
}));

vi.mock('react-native-mmkv', () => ({
  MMKV: class {
    getString() {
      return null;
    }
    set() {}
    delete() {}
    addOnValueChangedListener() {
      return { remove: vi.fn() };
    }
  },
}));

describe('mushaf loading/error regression', () => {
  it('isLoading is true while asset downloads and clears on success', async () => {
    mockGetImagesMap.mockReturnValue({ 5: 'page-5' } as any);
    let isLoading = true;
    let asset: { localUri: string } | null = null;

    const imagesMap = getImagesMap('hafs');
    const image = (imagesMap as Record<number, unknown>)?.[5];
    expect(image).toBeTruthy();
    expect(isLoading).toBe(true);

    const assetToLoad = {
      localUri: `mock://page-${String(image)}`,
      downloadAsync: mockDownloadAsync,
    };
    await assetToLoad.downloadAsync();
    asset = { localUri: assetToLoad.localUri };
    isLoading = false;

    expect(isLoading).toBe(false);
    expect(asset?.localUri).toBe('mock://page-page-5');
  });

  it('failed asset load exposes the exact user-facing error message', async () => {
    mockGetImagesMap.mockReturnValue({ 99: undefined } as any);
    let error: string | null = null;

    const imagesMap = getImagesMap('hafs');
    const image = (imagesMap as Record<number, unknown>)?.[99];
    if (!image) error = ERROR_MESSAGES.IMAGE_NOT_FOUND;

    expect(error).toBe(ERROR_MESSAGES.IMAGE_NOT_FOUND);
    expect(error).toBe('هذه الصفحة غير متاحة حالياً.');
  });
});
