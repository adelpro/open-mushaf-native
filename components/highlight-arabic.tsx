import React from 'react';
import { Text, TextStyle } from 'react-native';

interface HighlightTextProps {
  text: string;
  query: string;
  color?: string;
  style?: TextStyle;
}

/**
 * HighlightText component — highlights parts of the given text that match the query.
 */
export const HighlightText: React.FC<HighlightTextProps> = ({
  text,
  query,
  color = '#FFD54F',
  style,
}) => {
  if (!query.trim()) return <Text style={style}>{text}</Text>;

  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedQuery})`, 'gi');
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
