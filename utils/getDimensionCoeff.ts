/**
 * Represents dimensions used for calculating a size coefficient.
 */
type Dimension = {
  defaultDimension: number;
  customDimension: number;
};

/**
 * Calculates a coefficient ratio based on custom vs default dimensions.
 * This is useful for scaling UI elements proportionally based on screen size.
 *
 * @param args - The dimensions object.
 * @param args.defaultDimension - The base/default dimension to compare against.
 * @param args.customDimension - The new/custom dimension to use for scaling.
 *
 * @returns The ratio of custom dimension to default dimension.
 */
export const getDimensionCoeff = ({
  defaultDimension,
  customDimension,
}: Dimension) => {
  const x = customDimension / defaultDimension;
  return x;
};
