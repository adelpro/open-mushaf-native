import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Polygon, Svg } from 'react-native-svg';

import {
  parsePolygonPoints,
  pointInPolygon,
  polygonPointsString,
} from '@/utils/svgPolygon';

import { ThemedText } from './ThemedText';

/**
 * Polygon-based overlay that replaces `PageOverlay.tsx` (the old
 * rectangle heuristic). Renders one transparent `<Polygon>` per ayah
 * on top of the rendered SVG. Tapping the polygon fires the callback.
 *
 * Coordinates: the polygon's vertices are already in the SVG's
 * `viewBox` coordinate space. We pass the same viewBox to `<Svg>` so
 * the polygons scale with the rendered mushaf.
 *
 * Props:
 *  - polygons: hit regions for one page (from `useSvgPolygons`)
 *  - viewBox:  the SVG's own viewBox; both source SVG and overlay use it
 *  - activeAyah: { surah, ayah } currently selected (highlighted), or null
 *  - highlightColor / highlightOpacity: theme-driven highlight style
 *  - delayLongPress: ms before a press is treated as long-press (default 500)
 *  - onLongPressAyah(surah, ayah): fires after delayLongPress of press
 *    on a polygon. Used to open the tafseer popup for the pressed ayah.
 */
type Props = {
  polygons: {
    surahNumber: number;
    ayahNumber: number;
    polygon: string;
  }[];
  viewBox: { minX: number; minY: number; width: number; height: number };
  activeAyah: { surah: number; ayah: number } | null;
  highlightColor: string;
  highlightOpacity?: number;
  /** Fires after `delayLongPress` ms of uninterrupted press (default 500ms). */
  delayLongPress?: number;
  onLongPressAyah: (surah: number, ayah: number) => void;
};

export function PageOverlaySvg({
  polygons,
  viewBox,
  activeAyah,
  highlightColor,
  highlightOpacity = 0.45,
  delayLongPress = 500,
  onLongPressAyah,
}: Props) {
  // Normalize polygon vertices once per render. They never change
  // for a given (qiraa, page) combo, but useMemo is cheap insurance
  // against re-render storms.
  const normalized = useMemo(
    () =>
      polygons.map((p) => ({
        surah: p.surahNumber,
        ayah: p.ayahNumber,
        points: polygonPointsString(p.polygon),
      })),
    [polygons],
  );
  const [layout, setLayout] = useState({ width: 0, height: 0 });

  const handleLongPress = (event: any) => {
    if (!layout.width || !layout.height) return;

    const locationX = event?.nativeEvent?.locationX;
    const locationY = event?.nativeEvent?.locationY;
    if (typeof locationX !== 'number' || typeof locationY !== 'number') return;

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

    const match = normalized.find(({ points, surah, ayah }) => {
      const polygon = parsePolygonPoints(points);
      return pointInPolygon([x, y], polygon);
    });

    if (match) {
      onLongPressAyah(match.surah, match.ayah);
    }
  };

  return (
    <View
      pointerEvents="box-none"
      style={StyleSheet.absoluteFill}
      accessible={false}
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        setLayout({ width, height });
      }}
    >
      <Svg
        style={StyleSheet.absoluteFill}
        viewBox={`${viewBox.minX} ${viewBox.minY} ${viewBox.width} ${viewBox.height}`}
        preserveAspectRatio="xMidYMid meet"
        pointerEvents="box-none"
      >
        {/* Invisible catch-all to capture taps that miss every polygon.
            `fill="none"` is used (not `fill="transparent"`) because Firefox
            parses SVG `transparent` inconsistently across attribute vs.
            style-scoping boundaries and can fall back to the SVG default
            `black` fill — see https://bugzilla.mozilla.org/show_bug.cgi?id=629228.
            `fill="none"` is reliably invisible in every browser. */}
        <Polygon
          points={`${viewBox.minX},${viewBox.minY} ${viewBox.minX + viewBox.width},${viewBox.minY} ${viewBox.minX + viewBox.width},${viewBox.minY + viewBox.height} ${viewBox.minX},${viewBox.minY + viewBox.height}`}
          fill="none"
          pointerEvents="auto"
        />
        {normalized.map(({ surah, ayah, points }, i) => {
          const isActive =
            activeAyah != null &&
            activeAyah.surah === surah &&
            activeAyah.ayah === ayah;

          return (
            <Polygon
              // Include the array index: upstream JSON sometimes emits
              // multiple entries with the same (surahNumber, ayahNumber)
              // (e.g. surah-header band placeholders on page 9, where
              // every header polygon reports `{surah:0, ayah:0}`).
              // The original `${surah}-${ayah}` key then collides.
              key={`${surah}-${ayah}-${i}`}
              points={points}
              fill={isActive ? highlightColor : 'none'}
              fillOpacity={isActive ? highlightOpacity : 0}
              pointerEvents="auto"
            />
          );
        })}
      </Svg>
      <Pressable
        style={StyleSheet.absoluteFill}
        pointerEvents="auto"
        delayLongPress={delayLongPress}
        onLongPress={handleLongPress}
        accessible={false}
      />
    </View>
  );
}

/**
 * Inline error/empty state for the polygon overlay. Kept here so the
 * call site (`MushafPageSvg`) doesn't need its own empty branch.
 */
export function PageOverlaySvgFallback({ message }: { message?: string }) {
  return (
    <View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        { alignItems: 'center', justifyContent: 'center' },
      ]}
    >
      {message ? <ThemedText>{message}</ThemedText> : null}
    </View>
  );
}
