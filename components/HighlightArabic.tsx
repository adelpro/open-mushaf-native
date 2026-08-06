import React from 'react';
import { Text, TextStyle } from 'react-native';

import {
  getHighlightRanges,
  type HighlightRange,
  type MatchType,
} from 'quran-search-engine';

/**
 * Extended match type that includes the AI semantic-search 'dense' variant.
 * Compatible with quran-search-engine's MatchType — adding a new variant for
 * the hybrid retrieval path.
 */
export type ExtendedMatchType = MatchType | 'dense';

/**
 * Component configurations for dynamic text highlighting.
 */
type HighlightTextProps = {
  /** The complete Arabic text to be evaluated and formatted. */
  text: string;
  /** Array of explicitly matched tokens from the search engine. */
  matchedTokens: string[];
  /** Token-to-match-type mapping from the search engine. */
  tokenTypes?: Record<string, ExtendedMatchType>;
  /** HEX color code for exact match highlighting. */
  exactColor?: string;
  /** HEX color code for morphological (lemma/root) match highlighting. */
  relatedColor?: string;
  /** HEX color code for fuzzy match highlighting. */
  fuzzyColor?: string;
  /** HEX color code for AI semantic-match highlighting (dense path). */
  denseColor?: string;
  /** Optional TextStyle overrides to apply to the root wrapper. */
  style?: TextStyle;
};

const TextSelectionColor = '#010c14ff';

/**
 * Maps a match type to the appropriate highlight color.
 *
 * `dense` is the AI semantic-match color — used when the result came from
 * the dense retrieval path (cosine similarity on the verse embeddings). It
 * is intentionally a different color family from the keyword matches so the
 * UI can show the user which path found each verse.
 */
function getColorForMatchType(
  matchType: ExtendedMatchType,
  exactColor: string,
  relatedColor: string,
  fuzzyColor: string,
  denseColor: string,
): string {
  switch (matchType) {
    case 'exact':
    case 'range':
    case 'regex':
    case 'semantic':
      return exactColor;
    case 'lemma':
    case 'root':
      return relatedColor;
    case 'fuzzy':
      return fuzzyColor;
    case 'dense':
      return denseColor;
    default:
      return exactColor;
  }
}

/**
 * A specialized text formatting component that uses `getHighlightRanges` from
 * quran-search-engine to apply background colors corresponding to varying
 * degrees of search relevance (exact, morphological, or fuzzy matches).
 *
 * @param props - HighlightText component settings payload.
 * @returns An array of styled React Native Text fragments representing the original string.
 */
export const HighlightText: React.FC<HighlightTextProps> = ({
  text,
  matchedTokens,
  tokenTypes,
  exactColor = '#FFD54F',
  relatedColor = '#FFD211',
  fuzzyColor = '#81C784',
  denseColor = '#26A69A',
  style,
}) => {
  const ranges: HighlightRange[] = getHighlightRanges(
    text,
    matchedTokens,
    // Strip the 'dense' variant — quran-search-engine doesn't know about it;
    // we render those matches via a separate badge in the result item.
    tokenTypes as Record<string, MatchType> | undefined,
  );

  if (ranges.length === 0) {
    return <Text style={style}>{text}</Text>;
  }

  const parts: React.ReactNode[] = [];
  let cursor = 0;

  ranges.forEach((r, i) => {
    if (cursor < r.start) {
      parts.push(text.slice(cursor, r.start));
    }
    const bgColor = getColorForMatchType(
      r.matchType,
      exactColor,
      relatedColor,
      fuzzyColor,
      denseColor,
    );
    parts.push(
      <Text
        key={i}
        style={{ backgroundColor: bgColor, color: TextSelectionColor }}
      >
        {text.slice(r.start, r.end)}
      </Text>,
    );
    cursor = r.end;
  });

  if (cursor < text.length) {
    parts.push(text.slice(cursor));
  }

  return <Text style={style}>{parts}</Text>;
};
