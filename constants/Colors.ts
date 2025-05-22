const primary = '#1E5243'; // deep emerald green — calming, spiritual
const secondary = '#C2B280'; // soft sand/golden — evokes manuscript accents
const accent = '#A67C52'; // date-brown — traditional and warm

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
  },
};
