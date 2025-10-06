import React from 'react';
import { Text, TextStyle } from 'react-native';

type HighlightTextProps = {
  text: string;
  tokens: string[]; // <-- now an array of matched words
  color?: string;
  style?: TextStyle;
};

export const HighlightText: React.FC<HighlightTextProps> = ({
  text,
  tokens,
  color = '#FFD54F',
  style,
}) => {
  if (!tokens || tokens.length === 0) return <Text style={style}>{text}</Text>;

  // Escape tokens for regex
  const escapedTokens = tokens.map((t) =>
    t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
  );
  const regex = new RegExp(`(${escapedTokens.join('|')})`, 'gi');

  const parts = text.split(regex);

  return (
    <Text style={style}>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <Text key={index} style={{ backgroundColor: color }}>
            {part}
          </Text>
        ) : (
          <Text key={index}>{part}</Text>
        ),
      )}
    </Text>
  );
};
