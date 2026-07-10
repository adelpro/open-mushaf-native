import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { Path, Svg } from 'react-native-svg';

import { parseSvg } from '@/utils/svgParser';

type UnifiedSvgPageProps = {
  svgText: string;
  viewBox: { minX: number; minY: number; width: number; height: number };
  width: number;
  height: number;
  activeAyah: { surah: number; aya: number } | null; // changed 'ayah' -> 'aya'
  highlightColor: string;
  highlightOpacity?: number;
  onLongPressAyah: (surah: number, ayah: number) => void;
};

export function UnifiedSvgPage({
  svgText,
  viewBox,
  width,
  height,
  activeAyah,
  highlightColor,
  highlightOpacity = 0.45,
  onLongPressAyah,
}: UnifiedSvgPageProps) {
  const parsed = useMemo(() => parseSvg(svgText), [svgText]);
  if (!parsed) return null;

  const { paths } = parsed;

  return (
    <View style={{ width, height }}>
      <Svg
        width={width}
        height={height}
        viewBox={`${viewBox.minX} ${viewBox.minY} ${viewBox.width} ${viewBox.height}`}
        preserveAspectRatio="xMidYMid meet"
        style={StyleSheet.absoluteFill}
      >
        {paths.map((path, index) => {
          const isAyah = path.class?.includes('ayahPolygon') ?? false;
          const surah = path.surah ? Number(path.surah) : 0;
          const ayah = path.ayah ? Number(path.ayah) : 0;
          const isActive =
            isAyah &&
            activeAyah &&
            activeAyah.surah === surah &&
            activeAyah.aya === ayah; // changed .ayah -> .aya

          if (isAyah) {
            return (
              <Path
                key={path.id || `ayah-${index}`}
                d={path.d}
                fill={isActive ? highlightColor : 'transparent'}
                fillOpacity={isActive ? highlightOpacity : 0}
                onLongPress={() => onLongPressAyah(surah, ayah)}
              />
            );
          } else {
            return <Path key={path.id || `text-${index}`} d={path.d} />;
          }
        })}
      </Svg>
    </View>
  );
}
