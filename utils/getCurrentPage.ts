import specs from '@/assets/quran-metadata/mushaf-elmadina-warsh-azrak/specs.json';

export const getCurrentPage = (value: string | string[]): number | null => {
  const result = (() => {
    const num = Array.isArray(value)
      ? parseInt(value[0], 10)
      : parseInt(value, 10);

    if (isNaN(num)) {
      return null;
    }

    if (num < 1) {
      return 1;
    }

    if (num > specs.defaultNumberOfPages) {
      return specs.defaultNumberOfPages;
    }

    return num;
  })();

  return result;
};
