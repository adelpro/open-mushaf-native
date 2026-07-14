import { useMemo } from 'react';

import { Canvas, ImageSVG, Skia } from '@shopify/react-native-skia';

export type MushafPageSvgProps = {
  /** Raw SVG XML for the current mushaf page. Already pre-processed by
   *  `useSvgText` (ayah namespace stripped, opacity patched, dark-mode recolor). */
  xml: string;
  width: number;
  height: number;
};

/**
 * Renders a full Mushaf page SVG via Skia's `<ImageSVG>` node. The XML has
 * already been normalised by `useSvgText` (dark-mode recolor, ayah namespace
 * stripped, polygon opacity patched), so we feed it straight into
 * `Skia.SVG.MakeFromString` — no parser rewrite.
 *
 * The Canvas is sized to the parent `View`; `<ImageSVG>` does the
 * viewBox-aware scaling internally, replacing the previous
 * `preserveAspectRatio="xMidYMid meet"` behaviour.
 */
export function SkiaMushafPage({ xml, width, height }: MushafPageSvgProps) {
  // `Skia.SVG.MakeFromString` is a (small) native call; memoising on the XML
  // string keeps re-renders cheap when only `width`/`height` change (e.g. on
  // window resize).
  const svg = useMemo(() => Skia.SVG.MakeFromString(xml), [xml]);

  return (
    <Canvas style={{ width, height }}>
      {svg !== null && (
        <ImageSVG svg={svg} x={0} y={0} width={width} height={height} />
      )}
    </Canvas>
  );
}
