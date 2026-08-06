/**
 * Dev-only diagnostics screen for the AI / smart search subsystem.
 *
 * Route: /dev/ai-search
 *
 * - Renders the MMKV ring buffer captured by `utils/aiSearch/debugLog.ts`.
 * - Lets the developer clear the cache + log so the next AI query starts
 *   from a clean slate.
 *
 * Production users never see this screen — it is not linked from the main
 * navigation. The `__DEV__` short-circuit at the top means the route
 * resolves to a placeholder when bundled for release.
 */

import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { ThemedButton, ThemedText, ThemedView } from '@/components';
import {
  AI_SEARCH_CDN_FILES,
  ATM_V2_MODEL_BASE_URL,
} from '@/constants/aiSearch';
import { useColors } from '@/hooks';
import {
  __resetHybridEmbedderForTests,
  retryHybridEmbedder,
} from '@/hooks/useHybridSearch';
import { clearDebugLog, readDebugLog } from '@/utils/aiSearch/debugLog';
import { getCachedModelPath } from '@/utils/aiSearch/loadEmbedderModel';

export default function AiSearchDiagnostics() {
  const { dangerColor, cardColor, textColor } = useColors();
  const [log, setLog] = useState(() => readDebugLog());
  const [cachePath, setCachePath] = useState(() => getCachedModelPath());

  const refresh = useCallback(() => {
    setLog(readDebugLog());
    setCachePath(getCachedModelPath());
  }, []);

  const handleClearLog = () => {
    clearDebugLog();
    refresh();
  };

  const handleResetModel = () => {
    void retryHybridEmbedder();
    __resetHybridEmbedderForTests();
    refresh();
  };

  if (!__DEV__) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="defaultSemiBold">
          شاشة التشخيص متاحة فقط في وضع التطوير.
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">AI Search Diagnostics</ThemedText>

      <ThemedView
        style={[
          styles.section,
          { backgroundColor: cardColor, borderColor: textColor },
        ]}
      >
        <ThemedText type="defaultSemiBold">CDN base URL</ThemedText>
        <ThemedText style={styles.mono}>{ATM_V2_MODEL_BASE_URL}</ThemedText>

        <ThemedText type="defaultSemiBold" style={styles.spacerTop}>
          Files downloaded
        </ThemedText>
        <ThemedText style={styles.mono}>
          {AI_SEARCH_CDN_FILES.join(', ')}
        </ThemedText>

        <ThemedText type="defaultSemiBold" style={styles.spacerTop}>
          Cached model path
        </ThemedText>
        <ThemedText style={styles.mono}>{cachePath ?? '(none)'}</ThemedText>
      </ThemedView>

      <View style={styles.actionsRow}>
        <ThemedButton
          variant="outlined-primary"
          role="button"
          onPress={refresh}
          style={styles.actionButton}
        >
          تحديث
        </ThemedButton>
        <ThemedButton
          variant="outlined-primary"
          role="button"
          onPress={handleClearLog}
          style={styles.actionButton}
        >
          مسح السجل
        </ThemedButton>
        <ThemedButton
          variant="danger"
          role="button"
          onPress={handleResetModel}
          style={styles.actionButton}
        >
          مسح الكاش وإعادة التعيين
        </ThemedButton>
      </View>

      <ThemedText type="defaultSemiBold" style={styles.spacerTop}>
        Debug log ({log.length} entries)
      </ThemedText>

      <FlatList
        data={log}
        keyExtractor={(entry, idx) => `${entry.t}-${idx}`}
        renderItem={({ item }) => (
          <View
            style={[
              styles.logRow,
              {
                borderColor:
                  item.k === 'error'
                    ? dangerColor
                    : item.k === 'warn'
                      ? '#FFB74D'
                      : textColor,
              },
            ]}
          >
            <ThemedText style={styles.logMeta}>
              {new Date(item.t).toLocaleString()} · {item.k}
            </ThemedText>
            <ThemedText style={styles.logMessage}>{item.m}</ThemedText>
            {item.c ? (
              <ThemedText style={styles.logContext}>
                {JSON.stringify(item.c)}
              </ThemedText>
            ) : null}
          </View>
        )}
        ListEmptyComponent={
          <ThemedText style={styles.empty}>
            لا توجد سجلات بعد. شغّل البحث الذكي ثم ارجع إلى هنا.
          </ThemedText>
        }
        style={styles.list}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  section: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  mono: {
    fontFamily: 'Courier',
    fontSize: 12,
    marginTop: 4,
    writingDirection: 'ltr',
  },
  spacerTop: { marginTop: 12 },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    minWidth: 100,
  },
  list: { marginTop: 12 },
  logRow: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 8,
    marginBottom: 6,
  },
  logMeta: { fontSize: 11, opacity: 0.7 },
  logMessage: { fontSize: 13, marginTop: 2 },
  logContext: {
    fontFamily: 'Courier',
    fontSize: 11,
    marginTop: 2,
    opacity: 0.8,
    writingDirection: 'ltr',
  },
  empty: { fontStyle: 'italic', opacity: 0.6, marginTop: 8 },
});
