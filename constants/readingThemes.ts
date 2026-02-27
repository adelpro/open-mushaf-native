export type ReadingThemeConfig = {
  backgroundColor: string;
  imageOpacity: number;
  tintColor?: string;
};

export const READING_THEMES: Record<string, ReadingThemeConfig> = {
  default: {
    backgroundColor: '',
    imageOpacity: 1,
  },
  sepia: {
    backgroundColor: '#F4E8D1',
    imageOpacity: 0.92,
    tintColor: 'sepia',
  },
  highContrast: {
    backgroundColor: '#FFFFFF',
    imageOpacity: 1,
  },
};

export const READING_THEME_LABELS = ['عادي', 'ورقي', 'تباين عالي'];

export const READING_THEME_KEYS = ['default', 'sepia', 'highContrast'];
