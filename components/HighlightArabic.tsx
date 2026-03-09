import React from 'react';
import { Text, TextStyle } from 'react-native';

/**
 * Component configurations for dynamic text highlighting.
 */
type HighlightTextProps = {
  /** The complete Arabic text to be evaluated and formatted. */
  text: string;
  /** Array of explicitly matched tokens, typically for exact highlighting. */
  tokens: string[];
  /** Array of words conceptually related to the context or grammar. */
  relatedWords?: string[];
  /** Array of fuzzily matched words based on loose similarity. */
  fuzzyWords?: string[];
  /** HEX color code for exact match highlighting. */
  color?: string;
  /** HEX color code for related match highlighting. */
  relatedColor?: string;
  /** HEX color code for fuzzy match highlighting. */
  fuzzyColor?: string;
  /** Optional TextStyle overrides to apply to the root wrapper. */
  style?: TextStyle;
};

/**
 * A specialized text formatting component that dynamically applies background colors
 * corresponding to varying degrees of search relevance (direct, related, or fuzzy matches).
 * Utilizes complex regex splitting optimized for Arabic syntax.
 *
 * @param props - HighlightText component settings payload.
 * @returns An array of styled React Native Text fragments representing the original string.
 */
export const HighlightText: React.FC<HighlightTextProps> = ({
  text,
  tokens,
  relatedWords = [],
  fuzzyWords = [],
  color = '#FFD54F',
  relatedColor = '#FFD211',
  fuzzyColor = '#81C784',
  style,
}) => {
  const TextSelectionColor = '#010c14ff';
  // Default related color if not provided
  const actualRelatedColor = relatedColor || `${color}99`;

  if (
    (!tokens || tokens.length === 0) &&
    (!relatedWords || relatedWords.length === 0) &&
    (!fuzzyWords || fuzzyWords.length === 0)
  ) {
    return <Text style={style}>{text}</Text>;
  }

  // Combine direct tokens, related words and fuzzy words for highlighting
  const allTokens = [...tokens, ...relatedWords, ...fuzzyWords];

  // Escape tokens for regex
  const escapedTokens = allTokens.map((t) =>
    t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
  );

  // Create regex pattern for all tokens
  const regex = new RegExp(`(${escapedTokens.join('|')})`, 'gi');

  // Split text by regex pattern
  const parts = text.split(regex);

  return (
    <Text style={style}>
      {parts.map((part, index) => {
        // Check if this part matches any token
        const isDirectMatch = tokens.some((token) =>
          new RegExp(
            `^${token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`,
            'i',
          ).test(part),
        );

        // Check if this part matches any related word
        const isRelatedMatch = relatedWords.some((word) =>
          new RegExp(
            `^${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`,
            'i',
          ).test(part),
        );

        // Check if this part matches any fuzzy word
        const isFuzzyMatch = fuzzyWords.some((word) =>
          new RegExp(
            `^${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`,
            'i',
          ).test(part),
        );

        if (isDirectMatch) {
          // Direct match - primary highlight color
          return (
            <Text
              key={index}
              style={{ backgroundColor: color, color: TextSelectionColor }}
            >
              {part}
            </Text>
          );
        } else if (isRelatedMatch) {
          // Related match - slightly different highlight color
          return (
            <Text
              key={index}
              style={{
                backgroundColor: actualRelatedColor,
                color: TextSelectionColor,
              }}
            >
              {part}
            </Text>
          );
        } else if (isFuzzyMatch) {
          // Fuzzy match - different highlight color
          return (
            <Text
              key={index}
              style={{ backgroundColor: fuzzyColor, color: TextSelectionColor }}
            >
              {part}
            </Text>
          );
        } else {
          // No match
          return <Text key={index}>{part}</Text>;
        }
      })}
    </Text>
  );
};
