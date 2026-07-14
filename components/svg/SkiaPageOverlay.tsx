import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Canvas, Path } from '@shopify/react-native-skia';

import { parsePathToPoints, pointInPolygon } from '@/utils/svgParser';

export type PageOverlaySvgProps = {
  polygons: { surahNumber: number; ayahNumber: number; polygon: string }[];
  viewBox: { minX: number; minY: number; width: number; height: number };
  width: number;
  height: number;
  activeAyah: { surah: number; ayah: number } | null;
  highlightColor: string;
  highlightOpacity?: number;
  delayLongPress?: number;
  /** Called on a short press (tap) – toggles the top menu */
  onPress?: () => void;
  onLongPressAyah: (surah: number, ayah: number) => void;
};

/**
 * Hit-test overlay drawn on top of the Mushaf page SVG. Each ayah polygon is
 * rendered as a Skia `<Path>` (transparent fill except for the active ayah)
 * and a sibling absolutely-positioned `Pressable` captures long-presses, maps
 * the touch back into SVG viewBox space, and runs `pointInPolygon` against
 * the precomputed polygon point list. The hit-test math is preserved 1:1
 * from the previous `react-native-svg` implementation.
 */
export function PageOverlaySvg({
  polygons,
  viewBox,
  width,
  height,
  activeAyah,
  highlightColor,
  highlightOpacity = 0.45,
  delayLongPress = 500,
  onPress,
  onLongPressAyah,
}: PageOverlaySvgProps) {
  // Precompute points for hit-testing and keep the SVG path "d" for rendering.
  const processed = useMemo(
    () =>
      polygons.map((p) => ({
        ...p,
        points: parsePathToPoints(p.polygon),
      })),
    [polygons],
  );

  const [layout, setLayout] = useState({ width: 0, height: 0 });

  const handleLongPress = (event: {
    nativeEvent: { locationX: number; locationY: number };
  }) => {
    if (!layout.width || !layout.height) return;
    const { locationX, locationY } = event.nativeEvent;
    if (typeof locationX !== 'number' || typeof locationY !== 'number') return;

    // Map screen coordinates to SVG viewBox space (matches the previous
    // SvgXml scaling — `preserveAspectRatio="xMidYMid meet"` semantics).
    const aspectRatio = viewBox.width / viewBox.height;
    const containerAspect = layout.width / layout.height;
    let scale = 1;
    let offsetX = 0;
    let offsetY = 0;

    if (containerAspect > aspectRatio) {
      scale = layout.height / viewBox.height;
      offsetX = (layout.width - viewBox.width * scale) / 2;
    } else {
      scale = layout.width / viewBox.width;
      offsetY = (layout.height - viewBox.height * scale) / 2;
    }

    const x = (locationX - offsetX) / scale + viewBox.minX;
    const y = (locationY - offsetY) / scale + viewBox.minY;

    const match = processed.find(({ points }) =>
      pointInPolygon([x, y], points),
    );

    if (match) {
      onLongPressAyah(match.surahNumber, match.ayahNumber);
    }
  };

  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        { width, height, pointerEvents: 'box-none' as const },
      ]}
      onLayout={(e) => setLayout(e.nativeEvent.layout)}
    >
      <Canvas
        style={[
          StyleSheet.absoluteFill,
          { pointerEvents: 'box-none' as const },
        ]}
      >
        {processed.map(({ surahNumber, ayahNumber, polygon }, index) => {
          const isActive =
            activeAyah !== null &&
            activeAyah.surah === surahNumber &&
            activeAyah.ayah === ayahNumber;

          return (
            <Path
              key={`${surahNumber}-${ayahNumber}-${index}`}
              path={polygon}
              // Skia's <Path> parses the SVG "d" string natively. The polygon
              // stays invisible unless this ayah is the active selection.
              color={isActive ? highlightColor : 'transparent'}
              opacity={isActive ? highlightOpacity : 0}
            />
          );
        })}
      </Canvas>
      <Pressable
        style={[StyleSheet.absoluteFill, { pointerEvents: 'auto' as const }]}
        delayLongPress={delayLongPress}
        onPress={onPress}
        onLongPress={handleLongPress}
        accessible={false}
      />
    </View>
  );
}
