type Dimension = {
  defaultDimension: number;
  customDimension: number;
};
export const getDimensionCoeff = ({
  defaultDimension,
  customDimension,
}: Dimension) => {
  const x = customDimension / defaultDimension;
  return x;
};
