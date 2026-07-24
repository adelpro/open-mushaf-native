import React from 'react';
import { Text, TextStyle } from 'react-native';

/**
 * Lightweight in-place highlighter for Arabic search results.
 *
 * Phase 5: search comes from qurani.ai's `/search/<keyword>`
 * endpoint which doesn't return per-token highlight ranges, so we
 * do a simple substring match here against `matchedTokens`.
 * Replaces the previous dependency on `quran-search-engine`'s
 * `getHighlightRanges`.
 */

export type MatchType = 'exact' | 'lemma' | 'root' | 'fuzzy' | string;

type HighlightRange = {
  start: number;
  end: number;
  matchType: MatchType;
};

type HighlightTextProps = {
  /** The complete text to be evaluated and formatted. */
  text: string;
  /** Tokens from the search engine that should be highlighted. */
  matchedTokens: string[];
  /** Token-to-match-type mapping. */
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

function getColorForMatchType(
  matchType: MatchType,
  exactColor: string,
  relatedColor: string,
  fuzzyColor: string,
): string {
  switch (matchType) {
    case 'lemma':
    case 'root':
      return relatedColor;
    case 'fuzzy':
      return fuzzyColor;
    case 'exact':
    case 'range':
    case 'regex':
    case 'semantic':
    default:
      return exactColor;
  }
}

/**
 * Naive highlighter: for each matched token, find every
 * case-insensitive substring occurrence in `text` and emit a
 * range. Arabic text matching is approximated with simple
 * substring search — qurani.ai's response doesn't expose
 * character-level ranges, so a richer implementation would need
 * to download morphology data (out of scope for Phase 5).
 */
function computeHighlightRanges(
  text: string,
  matchedTokens: string[],
  tokenTypes?: Record<string, MatchType>,
): HighlightRange[] {
  if (matchedTokens.length === 0) return [];
  const ranges: HighlightRange[] = [];
  for (const tokenRaw of matchedTokens) {
    const token = tokenRaw.trim();
    if (!token) continue;
    const lowerText = text.toLowerCase();
    const lowerToken = token.toLowerCase();
    let from = 0;
    while (from < lowerText.length) {
      const idx = lowerText.indexOf(lowerToken, from);
      if (idx === -1) break;
      ranges.push({
        start: idx,
        end: idx + token.length,
        matchType: tokenTypes?.[token] ?? 'exact',
      });
      from = idx + token.length;
    }
  }
  // Sort + merge overlapping ranges.
  ranges.sort((a, b) => a.start - b.start);
  return ranges;
}

export const HighlightText: React.FC<HighlightTextProps> = ({
  text,
  matchedTokens,
  tokenTypes,
  exactColor = '#FFD54F',
  relatedColor = '#FFD211',
  fuzzyColor = '#81C784',
  style,
}) => {
  const ranges = computeHighlightRanges(text, matchedTokens, tokenTypes);

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
