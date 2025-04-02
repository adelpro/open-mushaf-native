import Fuse from 'fuse.js';

/**
 * Normalizes Arabic text by removing diacritics and standardizing characters
 */
export const normalizeArabicText = (text: string): string => {
  if (!text) return '';

  return text
    .replace(/[\u064B-\u065F]/g, '') // Remove tashkeel
    .replace(/[\u0622\u0623\u0625]/g, '\u0627') // Normalize alef
    .replace(/[\u0624\u0626]/g, '\u0621') // Normalize hamza
    .replace(/\u0649/g, '\u064A'); // Normalize ya/alif maqsura
};

/**
 * Creates a configured Fuse instance for Arabic text search
 */
export const createArabicFuseSearch = <T>(
  collection: T[],
  keys: string[],
): Fuse<T> => {
  return new Fuse(collection, {
    includeScore: true,
    threshold: 0.3,
    ignoreLocation: true,
    useExtendedSearch: true,
    keys,
  });
};

/**
 * Simple search function that filters items based on a query
 */
export const simpleSearch = <T extends Record<string, any>>(
  items: T[],
  query: string,
  searchField: keyof T,
): T[] => {
  if (!query.trim()) return [];

  const normalizedQuery = normalizeArabicText(query.toLowerCase());

  return items.filter((item) => {
    const fieldValue = String(item[searchField] || '');
    const normalizedField = normalizeArabicText(fieldValue.toLowerCase());
    return normalizedField.includes(normalizedQuery);
  });
};
