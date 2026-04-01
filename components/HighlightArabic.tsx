import React from 'react';
import { Text, TextStyle } from 'react-native';

import {
  getHighlightRanges,
  type HighlightRange,
  type MatchType,
} from 'quran-search-engine';

/**
 * Component configurations for dynamic text highlighting.
 */
type HighlightTextProps = {
  /** The complete Arabic text to be evaluated and formatted. */
  text: string;
  /** Array of explicitly matched tokens from the search engine. */
  matchedTokens: string[];
  /** Token-to-match-type mapping from the search engine. */
  tokenTypes?: Record<string, MatchType>;
  /** HEX color code for exact match highlighting. */
  exactColor?: string;
  /** HEX color code for morphological (lemma/root) match highlighting. */
  relatedColor?: string;
  /** HEX color code for fuzzy match highlighting. */
  fuzzyColor?: string;
  /** Optional TextStyle overrides to apply to the root wrapper. */
  style?: TextStyle;
};

const TextSelectionColor = '#010c14ff';

/**
 * Maps a match type to the appropriate highlight color.
 */
function getColorForMatchType(
  matchType: MatchType,
  exactColor: string,
  relatedColor: string,
  fuzzyColor: string,
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
  style,
}) => {
  const ranges: HighlightRange[] = getHighlightRanges(
    text,
    matchedTokens,
    tokenTypes,
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
