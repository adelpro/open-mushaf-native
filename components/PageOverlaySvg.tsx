import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Path, Svg } from 'react-native-svg';

import { parsePathToPoints, pointInPolygon } from '@/utils/svgParser';

type PageOverlaySvgProps = {
  polygons: { surahNumber: number; ayahNumber: number; polygon: string }[];
  viewBox: { minX: number; minY: number; width: number; height: number };
  width: number;
  height: number;
  activeAyah: { surah: number; ayah: number } | null;
  highlightColor: string;
  highlightOpacity?: number;
  delayLongPress?: number;
  onLongPressAyah: (surah: number, ayah: number) => void;
};

export function PageOverlaySvg({
  polygons,
  viewBox,
  width,
  height,
  activeAyah,
  highlightColor,
  highlightOpacity = 0.45,
  delayLongPress = 500,
  onLongPressAyah,
}: PageOverlaySvgProps) {
  // Precompute points for hit-testing and keep d for rendering
  const processed = useMemo(
    () =>
      polygons.map((p) => ({
        ...p,
        points: parsePathToPoints(p.polygon),
      })),
    [polygons],
  );

  const [layout, setLayout] = useState({ width: 0, height: 0 });

  const handleLongPress = (event: any) => {
    if (!layout.width || !layout.height) return;
    const { locationX, locationY } = event.nativeEvent;
    if (typeof locationX !== 'number' || typeof locationY !== 'number') return;

    // Map screen coordinates to SVG viewBox space (same as SvgXml scaling)
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
      <Svg
        width={width}
        height={height}
        viewBox={`${viewBox.minX} ${viewBox.minY} ${viewBox.width} ${viewBox.height}`}
        preserveAspectRatio="xMidYMid meet"
        style={[
          StyleSheet.absoluteFill,
          { pointerEvents: 'box-none' as const },
        ]}
      >
        {processed.map(({ surahNumber, ayahNumber, polygon }, index) => {
          const isActive =
            activeAyah &&
            activeAyah.surah === surahNumber &&
            activeAyah.ayah === ayahNumber;

          return (
            <Path
              key={`${surahNumber}-${ayahNumber}-${index}`}
              d={polygon}
              fill={isActive ? highlightColor : 'transparent'}
              fillOpacity={isActive ? highlightOpacity : 0}
              // no direct events – handled by Pressable
              style={{ pointerEvents: 'none' }}
            />
          );
        })}
      </Svg>
      <Pressable
        style={[StyleSheet.absoluteFill, { pointerEvents: 'auto' as const }]}
        delayLongPress={delayLongPress}
        onLongPress={handleLongPress}
        accessible={false}
      />
    </View>
  );
}
