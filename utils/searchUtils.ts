import Fuse, { type IFuseOptions } from 'fuse.js';

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
  options: Partial<IFuseOptions<T>> = {},
): Fuse<T> => {
  return new Fuse(collection, {
    includeScore: true,
    threshold: 0.9,
    ignoreLocation: true,
    useExtendedSearch: true,
    keys,
    ...options,
  });
};

export const performAdvancedSearch = <T extends Record<string, any>>(
  fuseInstance: Fuse<T>,
  query: string,
  searchFields: string[] = ['uthmani', 'standard'],
  originalCollection?: T[],
): T[] => {
  if (!query.trim()) return [];

  // Try exact matches first using simpleSearch if we have original collection
  if (originalCollection) {
    const exactMatches = searchFields.flatMap((field) =>
      simpleSearch(originalCollection, query, field as keyof T),
    );

    // Remove duplicates
    const uniqueMatches = Array.from(
      new Set(exactMatches.map((item) => JSON.stringify(item))),
    ).map((item) => JSON.parse(item));

    if (uniqueMatches.length > 0) return uniqueMatches;
  }

  // Fall back to fuzzy search if no exact matches
  return fuseInstance
    .search(normalizeArabicText(query.toLowerCase()))
    .map((result) => result.item);
};

export const simpleSearch = <T extends Record<string, any>>(
  items: T[],
  query: string,
  searchField: keyof T,
): T[] => {
  if (!query.trim()) return [];

  const normalizedQuery = normalizeArabicText(query.toLowerCase());

  return items.filter((item) => {
    const normalizedField = normalizeArabicText(
      String(item[searchField] || '').toLowerCase(),
    );
    return normalizedField.includes(normalizedQuery);
  });
};
