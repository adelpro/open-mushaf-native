import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

export default function ErrorRender({ error }: { error: Error }) {
  return (
    <ThemedView>
      <ThemedText type="title">Error</ThemedText>
      <ThemedText>{error.message}</ThemedText>
    </ThemedView>
  );
}
