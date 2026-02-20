const primary = '#1E5243';
const secondary = '#C2B280';

const tintColorDark = '#F1F3F4';

export const Colors = {
  light: {
    text: '#1B1B1B',
    background: '#FAF8F6',
    tint: primary,
    icon: '#6D6D6D',
    tabIconDefault: '#A0A0A0',
    tabIconSelected: primary,
    primary,
    primaryLight: '#62A49B',
    secondary,
    danger: '#C62828',
    dangerLight: '#FFCDD2',
    ivory: '#F9F6EF',
    card: '#FFFFFF',

    // UI chrome colors
    border: '#ddd',
    borderLight: '#E5E7EB',
    inactiveIcon: '#777',
    subtleBg: 'rgba(0, 0, 0, 0.03)',
    overlay: 'rgba(0, 0, 0, 0.5)',
    activeOptionBg: '#e3f2fd',
    activeOptionBorder: '#1976d2',
    activeOptionText: '#1976d2',

    // Text Highlight colors
    directColor: '#FFD700',
    relatedColor: '#4FC3F7',
    fuzzyColor: '#FF8A65',
  },
  dark: {
    text: '#EDEDED',
    background: '#121212',
    tint: tintColorDark,
    icon: '#A0A0A0',
    tabIconDefault: '#666',
    tabIconSelected: tintColorDark,
    primary,
    primaryLight: '#62A49B',
    secondary: '#A0A07E',
    danger: '#EF5350',
    dangerLight: '#E57373',
    ivory: '#2E2E2E',
    card: '#1E1E1E',

    // UI chrome colors
    border: '#444',
    borderLight: '#333',
    inactiveIcon: '#888',
    subtleBg: 'rgba(255, 255, 255, 0.05)',
    overlay: 'rgba(0, 0, 0, 0.7)',
    activeOptionBg: '#1a3a5c',
    activeOptionBorder: '#42a5f5',
    activeOptionText: '#42a5f5',

    // Text Highlight colors
    directColor: '#FFA000',
    relatedColor: '#03A9F4',
    fuzzyColor: '#FF5722',
  },
};
