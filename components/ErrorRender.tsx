import { Button } from 'react-native';

import { FallbackProps } from 'react-error-boundary';

import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

export default function ErrorRender({
  error,
  resetErrorBoundary,
}: FallbackProps) {
  return (
    <ThemedView>
      <ThemedText type="title">Error</ThemedText>
      <ThemedText>{error.message}</ThemedText>
      <Button title="إعادة المحاولة" onPress={resetErrorBoundary} />
    </ThemedView>
  );
}
