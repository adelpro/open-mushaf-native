import { useWindowDimensions } from 'react-native';

export default function useOrientation() {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  return { isLandscape };
}
