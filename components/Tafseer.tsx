import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
} from 'react-native';

import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAtom } from 'jotai/react';
import HTMLView from 'react-native-htmlview';

import { quranTafseerUrl, TafseerKey } from '@/constants/TafseerCdn';
import {
  hasNoTafseerContent,
  useColors,
  useDownloadStatus,
  useQuranMetadata,
  useTafseerContent,
} from '@/hooks';
import { tafseerTab } from '@/jotai/atoms';
import { TafseerAya } from '@/types';
import { persistTafseer, readTafseerFromDisk } from '@/utils/downloads';

import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

// Map from internal keys to display labels (matches TafseerKey)
const tabLabels: Record<TafseerKey, string> = {
  katheer: 'إبن كثير',
  maany: 'معاني القرآن',
  earab: 'إعراب القرآن',
  baghawy: 'البغوي',
  muyassar: 'الميسر',
  qortoby: 'القرطبي',
  tabary: 'الطبري',
  saady: 'السعدي',
  'nozool-wahidy': 'أسباب النزول',
  tanweer: 'التحرير و التنوير',
};

type Props = {
  aya: number;
  surah: number;
  opacity?: number;
};

export function Tafseer({ aya, surah, opacity = 1 }: Props) {
  const { tintColor, textColor, primaryColor } = useColors();
  const { surahData, specsData } = useQuranMetadata();
  const { countBesmalAya } = specsData ?? {};
  const router = useRouter();
  const { tafseerIsDownloaded } = useDownloadStatus();

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
  }, [selectedTab, surah, aya, cache]); // re‑fetch if surah/aya changes (even if cached data exists, we keep it; the hook `useTafseerContent` will filter by surah/aya)

  // Reset cache when surah or aya changes? We could keep cache but the content check might need fresh.
  // Actually we want to keep the data but the hasNoTafseerContent will check within the same surah/aya.
  // So we don't need to reset cache.

  const formattedTafseerHtml = useTafseerContent({
    tafseerData,
    surah,
    aya,
  });

  // Get list of tabs (all keys from tabLabels)
  const tabKeys = Object.keys(tabLabels) as TafseerKey[];

  return (
    <ThemedView
      style={[styles.container, opacity !== undefined ? { opacity } : {}]}
    >
      <ThemedText style={[styles.title, { backgroundColor: 'transparent' }]}>
        {surahName} - الآية {countBesmalAya ? aya : aya - 1}
      </ThemedText>

      <ThemedView style={[styles.tabs, { backgroundColor: 'transparent' }]}>
        {tabKeys.map((tabKey) => {
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
              accessibilityLabel={`${tabLabels[tabKey]} tab for Surah ${surahName}, Aya ${aya}`}
              accessibilityHint={`Tap to see the tafseer for Surah ${surahName}, Aya ${aya} from ${tabLabels[tabKey]}`}
              disabled={isDisabled}
            >
              <ThemedText
                style={[
                  { color: tintColor, backgroundColor: 'transparent' },
                  isDisabled && styles.disabledTabText,
                ]}
              >
                {tabLabels[tabKey]}
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
    gap: 2,
    justifyContent: 'flex-start',
    marginBottom: 10,
  },
  tabButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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
