import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
} from 'react-native';

import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAtom, useAtomValue } from 'jotai/react';
import HTMLView from 'react-native-htmlview';

import {
  quranTafseerUrl,
  TAFSEER_ARABIC_LABEL,
  TafseerKey,
  TAFSEERS_LIST,
} from '@/constants/TafseerCdn';
import {
  findTafseerByGid,
  hasNoTafseerContent,
  useColors,
  useDownloadStatus,
  useQuranMetadata,
  useRiwayaCache,
  useTranslation,
} from '@/hooks';
import { selectedTranslation, tafseerTab } from '@/jotai/atoms';
import { TafseerAya } from '@/types';
import { persistTafseer, readTafseerFromDisk } from '@/utils/downloads';

import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

/**
 * Canonical display order for the tafseer tabs. Pulled from the
 * `TAFSEERS` tuple in `@/constants/TafseerCdn` so the popup matches
 * the Downloads screen — one source of truth for tafseer metadata.
 */
const TAB_KEYS = [...TAFSEERS_LIST];

type Props = {
  /** qurani.ai gid (canonical internal id, 1..6236). Phase 3 looks up
   *  gid → (sura, nIS) via the narration cache, then finds the row.
   *  Phase 4 (qurani.ai tafseers) skips the indirection and looks up
   *  directly by gid. */
  gid: number;
  /** Per-narration ayah number (the user's chosen riwaya's `numberInSurah`). */
  aya: number;
  /** Surah number (1..114). */
  surah: number;
  opacity?: number;
};

export function Tafseer({ gid, aya, surah, opacity = 1 }: Props) {
  const { tintColor, textColor, primaryColor } = useColors();
  const { surahData } = useQuranMetadata();
  const { layoutNumberByGid, isReady: isCacheReady } = useRiwayaCache();
  const router = useRouter();
  const { tafseerIsDownloaded } = useDownloadStatus();
  const translationId = useAtomValue(selectedTranslation);
  const { getText: getTranslationText } = useTranslation({
    translationId,
  });

  const [surahName, setSurahName] = useState<string>('');
  const [selectedTab, setSelectedTab] = useAtom(tafseerTab) as [
    TafseerKey,
    (key: TafseerKey) => void,
  ];
  const [tafseerData, setTafseerData] = useState<TafseerAya[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Cache loaded data per tab to avoid repeated fetches
  const [cache, setCache] = useState<Record<TafseerKey, TafseerAya[] | null>>(
    {} as Record<TafseerKey, TafseerAya[] | null>,
  );

  useEffect(() => {
    const currentSurah = surahData.find((s) => s.number === surah);
    setSurahName(currentSurah?.name ?? '');
  }, [surah, surahData]);

  // Fetch tafseer data when selectedTab, surah, or aya changes. Phase 3
  // adds an offline disk cache: on native, the local FS cache is read
  // first; on miss, the CDN response is fetched, parsed, AND persisted
  // back to disk so the next long-press on an ayah (offline or online)
  // serves locally.
  useEffect(() => {
    const fetchTafseer = async () => {
      // If we have cached data for this tab, use it
      if (cache[selectedTab] !== undefined) {
        setTafseerData(cache[selectedTab]);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        // Native: try the disk cache first (Phase 3).
        if (Platform.OS !== 'web') {
          const diskRaw = await readTafseerFromDisk(selectedTab);
          if (diskRaw != null) {
            try {
              const data = (JSON.parse(diskRaw) as TafseerAya[]) || [];
              setTafseerData(data);
              setCache((prev) => ({ ...prev, [selectedTab]: data }));
              return;
            } catch {
              // Bad JSON on disk — fall through to network re-fetch.
            }
          }
        }

        // Network fetch. Read as text first so we can persist the raw
        // bytes after parsing (body is single-shot).
        const url = quranTafseerUrl(selectedTab);
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const rawText = await response.text();
        const data = (JSON.parse(rawText) as TafseerAya[]) || [];
        setTafseerData(data);
        setCache((prev) => ({ ...prev, [selectedTab]: data }));

        // Persist for next cold start. Best-effort — a write failure
        // must not break the in-memory render.
        if (Platform.OS !== 'web') {
          await persistTafseer(selectedTab, rawText);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'فشل تحميل التفسير');
        setTafseerData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTafseer();
  }, [selectedTab, surah, aya, cache]);

  // Phase 3 gid-first lookup: when the narration cache is ready, use
  // gid + layoutNumberByGid to resolve the lookup. The legacy
  // (sura, aya) lookup inside `useTafseerContent` is kept as a
  // fallback when the cache isn't ready (defensive — shouldn't
  // happen in practice since the cache is loaded on app boot).
  const gidResolved = isCacheReady ? layoutNumberByGid.get(gid) : undefined;

  const formattedTafseerHtml =
    isCacheReady && gidResolved !== undefined
      ? (() => {
          const row = findTafseerByGid(
            tafseerData,
            gid,
            surah,
            layoutNumberByGid,
          );
          if (!row?.text || row.text === '<p></p>') {
            return '<p>لا يوجد تفسير.</p>';
          }
          return `<div>${row.text}</div>`;
        })()
      : '';

  return (
    <ThemedView
      style={[styles.container, opacity !== undefined ? { opacity } : {}]}
    >
      <ThemedText style={[styles.title, { backgroundColor: 'transparent' }]}>
        {surahName} - الآية {aya}
      </ThemedText>

      <ThemedView style={[styles.tabs, { backgroundColor: 'transparent' }]}>
        {TAB_KEYS.map((tabKey) => {
          const isSelected = tabKey === selectedTab;
          // Only show disabled state if we have loaded the data for this tab and it's empty
          const hasContent =
            cache[tabKey] !== undefined
              ? !hasNoTafseerContent({
                  tafseerData: cache[tabKey],
                  surah,
                  aya,
                })
              : true; // assume it has content until proven otherwise (we can't know without fetch)

          const isDisabled = !hasContent && cache[tabKey] !== undefined;
          const isDownloaded = tafseerIsDownloaded(tabKey);

          return (
            <Pressable
              key={tabKey}
              style={[
                styles.tabButton,
                isSelected && styles.activeTab,
                isSelected && { borderColor: tintColor },
                isDisabled && styles.disabledTab,
                { backgroundColor: 'transparent' },
              ]}
              onPress={() => setSelectedTab(tabKey)}
              accessibilityLabel={`${TAFSEER_ARABIC_LABEL[tabKey]} tab for Surah ${surahName}, Aya ${aya}`}
              accessibilityHint={`Tap to see the tafseer for Surah ${surahName}, Aya ${aya} from ${TAFSEER_ARABIC_LABEL[tabKey]}`}
              disabled={isDisabled}
            >
              <ThemedText
                numberOfLines={1}
                style={[
                  { color: tintColor, backgroundColor: 'transparent' },
                  isDisabled && styles.disabledTabText,
                ]}
              >
                {TAFSEER_ARABIC_LABEL[tabKey]}
              </ThemedText>
              {isDownloaded ? (
                <Feather
                  name="check-circle"
                  size={11}
                  color={primaryColor}
                  style={styles.tabDownloadedBadge}
                />
              ) : (
                <Feather
                  name="download"
                  size={11}
                  color={tintColor + '88'}
                  style={styles.tabDownloadedBadge}
                />
              )}
            </Pressable>
          );
        })}
      </ThemedView>

      {loading ? (
        <ActivityIndicator size="large" color={tintColor} />
      ) : (
        (() => {
          // When the user picks a tafseer that's NOT downloaded, show
          // an explicit CTA to the Downloads page. Otherwise fetch the
          // selected tab as before. We compute this each render — the
          // tab may flip online↔offline between mounts.
          const selectedDownloaded = tafseerIsDownloaded(selectedTab);
          if (!error && !selectedDownloaded) {
            return (
              <ThemedView
                style={[
                  styles.notDownloadedCard,
                  { borderColor: tintColor + '44' },
                ]}
              >
                <Feather
                  name="cloud-off"
                  size={28}
                  color={primaryColor}
                  style={{ marginBottom: 6 }}
                />
                <ThemedText
                  type="defaultSemiBold"
                  style={{ textAlign: 'center' }}
                >
                  هذا التفسير غير محمّل للقراءة دون اتصال
                </ThemedText>
                <ThemedText
                  style={{
                    fontSize: 12,
                    opacity: 0.6,
                    textAlign: 'center',
                    marginTop: 6,
                    marginBottom: 12,
                  }}
                >
                  لن يتم تنزيل هذا التفسير تلقائيًا. افتح صفحة التنزيلات لإضافته
                  إلى جهازك.
                </ThemedText>
                <Pressable
                  onPress={() => router.push('/downloads')}
                  style={({ pressed }) => [
                    styles.notDownloadedCta,
                    {
                      backgroundColor: primaryColor + '15',
                      borderColor: primaryColor + '55',
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="افتح صفحة التنزيلات"
                >
                  <Feather name="download" size={16} color={primaryColor} />
                  <ThemedText
                    style={[
                      styles.notDownloadedCtaLabel,
                      { color: primaryColor },
                    ]}
                  >
                    افتح التنزيلات
                  </ThemedText>
                </Pressable>
              </ThemedView>
            );
          }
          if (error) {
            return (
              <ThemedText
                style={{ color: 'red', textAlign: 'center', padding: 20 }}
              >
                {error}
              </ThemedText>
            );
          }
          return tafseerData ? (
            <ThemedView style={{ flex: 1 }}>
              {/* @ts-ignore - HTMLView types may be incomplete */}
              <HTMLView
                value={formattedTafseerHtml}
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  backgroundColor: 'transparent',
                }}
                stylesheet={{
                  div: {
                    color: textColor,
                    fontFamily: 'Tajawal_400Regular',
                    fontSize: 16,
                    lineHeight: 24,
                    backgroundColor: 'transparent',
                  },
                  p: {
                    color: textColor,
                    fontFamily: 'Tajawal_400Regular',
                    fontSize: 16,
                    lineHeight: 24,
                    flexDirection: 'row',
                    backgroundColor: 'transparent',
                  },
                }}
                addLineBreaks={false}
              />
              {translationId
                ? (() => {
                    const translationText = getTranslationText(gid);
                    if (!translationText) return null;
                    return (
                      <ThemedView
                        style={[
                          styles.translationBlock,
                          { borderTopColor: textColor + '22' },
                        ]}
                      >
                        <ThemedText style={styles.translationLabel}>
                          ترجمة ({translationId})
                        </ThemedText>
                        <ThemedText style={styles.translationText}>
                          {translationText}
                        </ThemedText>
                      </ThemedView>
                    );
                  })()
                : null}
            </ThemedView>
          ) : (
            <ThemedText style={{ textAlign: 'center', padding: 20 }}>
              لا يوجد تفسير لهذه الآية
            </ThemedText>
          );
        })()
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    backgroundColor: 'transparent',
    padding: 5,
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
    padding: 8,
    fontFamily: 'Amiri_400Regular',
  },
  tabs: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  tabButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  disabledTab: {
    opacity: 0.5,
  },
  disabledTabText: {
    textDecorationLine: 'line-through',
  },
  tabDownloadedBadge: {
    marginHorizontal: 3,
  },
  translationBlock: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  translationLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 6,
    fontFamily: 'Tajawal_500Medium',
  },
  translationText: {
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'left',
    writingDirection: 'ltr',
    fontFamily: 'Tajawal_400Regular',
  },
  notDownloadedCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    alignItems: 'center',
  },
  notDownloadedCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    alignSelf: 'center',
  },
  notDownloadedCtaLabel: {
    fontSize: 14,
    fontFamily: 'Tajawal_500Medium',
  },
});
