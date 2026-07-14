import { useMemo } from 'react';

import { Canvas, Circle, Path, Skia } from '@shopify/react-native-skia';

/**
 * Props for {@link DailyProgressRing}. Matches the previous inline component
 * that lived in `components/TopMenu.tsx` so call sites need no changes.
 */
export type DailyProgressRingProps = {
  size: number;
  thickness: number;
  progress: number;
  color: string;
  unfilledColor: string;
};

/**
 * Tiny circular progress ring for the daily-wird (الورد اليومي) badge in the
 * top menu. Renders on Skia's `<Canvas>` so it works on iOS / Android / web
 * without a `Platform.OS` branch.
 *
 * Implementation note: Skia's `<Circle>` doesn't expose `start`/`end`
 * arc-clipping props the way some Skia wrappers do, so the progress arc is
 * built with `Skia.Path.Make().addArc(...)` and rendered as a stroked
 * `<Path>`. The full unfilled track is a plain stroked `<Circle>`.
 */
export function DailyProgressRing({
  size,
  thickness,
  progress,
  color,
  unfilledColor,
}: DailyProgressRingProps) {
  const clamped = Math.max(0, Math.min(1, progress));
  const radius = (size - thickness) / 2;
  const center = size / 2;

  // Memoised SkPath for the progress arc. Sweeps from the 12 o'clock position
  // (-π/2 radians) clockwise for `clamped * 2π` radians. At progress=0 the
  // sweep is zero so the path is invisible; at progress=1 we draw a full ring.
  const progressPath = useMemo(() => {
    const p = Skia.Path.Make();
    if (clamped > 0) {
      p.addArc(
        {
          x: center - radius,
          y: center - radius,
          width: radius * 2,
          height: radius * 2,
        },
        -Math.PI / 2,
        2 * Math.PI * clamped,
      );
    }
    return p;
  }, [clamped, center, radius]);

  return (
    <Canvas style={{ width: size, height: size }}>
      <Circle
        cx={center}
        cy={center}
        r={radius}
        color={unfilledColor}
        style="stroke"
        strokeWidth={thickness}
      />
      <Path
        path={progressPath}
        color={color}
        style="stroke"
        strokeWidth={thickness}
        strokeCap="round"
      />
    </Canvas>
  );
}
