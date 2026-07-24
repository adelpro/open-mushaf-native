/**
 * Phase-1 text-based mushaf page renderer (with Phase-7 polish).
 *
 * Reads the active riwaya's page bundle from `usePageBundle` and
 * renders one surah header + verse rows. Replaces the deleted SVG
 * `MushafPageSvg` component.
 *
 * Verse rows are tap-to-select — long-press opens the tafseer popup
 * via `TafseerPopup`. The gid is resolved from
 * `(surah, numberInSurah)` via `useRiwayaCache().gidByLayoutKey`,
 * so per-narration differences (Hafs Bismillah vs Warsh skipped) flow
 * through automatically.
 *
 * Phase 7 polish: an optional `onPageChange` callback enables
 * horizontal pan-to-flip-page gestures (delegates to
 * `usePanGestureHandler`). When not provided, the page is read-only.
 */

import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import { useAtomValue } from 'jotai/react';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';

import { usePageBundle } from '@/hooks/usePageBundle';
import { usePagePreloader } from '@/hooks/usePagePreloader';
import { usePanGestureHandler } from '@/hooks/usePanGestureHandler';
import { mushafRiwaya, panGestureSensitivity } from '@/jotai/atoms';
import type { QuranApiPageBundle, QuranApiText } from '@/types/quran-api';

import { AyahRow } from './AyahRow';
import { SurahHeader } from './SurahHeader';
import { TafseerPopup } from './TafseerPopup';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

type Props = {
  page: number;
  /** Optional handler called with `+1` (next) or `-1` (prev) on swipe. */
  onPageChange?: (delta: number) => void;
};

export function MushafPageText({ page, onPageChange }: Props) {
  const riwaya = useAtomValue(mushafRiwaya);
  const sensitivity = useAtomValue(panGestureSensitivity);
  const { translateX, panGestureHandler } = usePanGestureHandler(
    onPageChange ?? (() => {}),
    sensitivity,
  );

  const { bundle, isLoading, error } = usePageBundle({
    riwaya: riwaya,
    page,
  });

  // Preload the ±2 page window so swipe-between-pages feels instant.
  usePagePreloader(page);

  const [selectedAya, setSelectedAya] = useQuranApiAyaSelectionState();

  const handlePressAyah = useCallback(
    (gid: number, surah: number, layoutAyah: number) => {
      setSelectedAya({ gid, surah, layoutAyah });
    },
    [setSelectedAya],
  );

  const handleClosePopup = useCallback(() => {
    setSelectedAya(null);
  }, [setSelectedAya]);

  if (!riwaya) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText>اختر رواية لبدء القراءة</ThemedText>
      </ThemedView>
    );
  }

  if (isLoading && !bundle) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (error && !bundle) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText type="defaultSemiBold" style={styles.error}>
          {error}
        </ThemedText>
      </ThemedView>
    );
  }

  if (!bundle) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText>لا توجد بيانات لهذه الصفحة</ThemedText>
      </ThemedView>
    );
  }

  const grouped = groupBundleBySurah(bundle);

  const pageContent = (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        {grouped.map((group) => (
          <View key={group.surah} style={styles.surahBlock}>
            <SurahHeader number={group.surah} />
            {group.ayahs.map((a) => (
              <AyahRow
                key={a.gid}
                ayah={a}
                onPress={() => handlePressAyah(a.gid, a.surah, a.numberInSurah)}
                selected={selectedAya?.gid === a.gid}
              />
            ))}
          </View>
        ))}
      </ScrollView>

      {selectedAya ? (
        <TafseerPopup
          show
          setShow={handleClosePopup}
          gid={selectedAya.gid}
          surah={selectedAya.surah}
          layoutAyah={selectedAya.layoutAyah}
        />
      ) : null}
    </ThemedView>
  );

  // Phase 7: wrap in a GestureDetector for pan-to-flip-page gestures.
  // The Pan handler only fires on horizontal swipes — the inner
  // ScrollView handles vertical scrolling without conflict.
  return onPageChange ? (
    <GestureDetector gesture={panGestureHandler}>
      <Animated.View
        style={[styles.container, { transform: [{ translateX }] }]}
      >
        {pageContent}
      </Animated.View>
    </GestureDetector>
  ) : (
    pageContent
  );
}

/**
 * Group a page bundle into per-surah blocks. Multi-surah pages
 * (e.g. p.106 = Nisa + Maidah) need a surah header inline between
 * the verse runs.
 */
function groupBundleBySurah(bundle: QuranApiPageBundle): {
  surah: number;
  ayahs: QuranApiText[];
}[] {
  const groups: { surah: number; ayahs: QuranApiText[] }[] = [];
  for (const a of bundle.ayahs) {
    const last = groups[groups.length - 1];
    if (last && last.surah === a.surah) {
      last.ayahs.push(a);
    } else {
      groups.push({ surah: a.surah, ayahs: [a] });
    }
  }
  return groups;
}

// ─────── local state hook (kept here so the file is self-contained) ───────

type SelectedAya = {
  gid: number;
  surah: number;
  layoutAyah: number;
};

function useQuranApiAyaSelectionState(): [
  SelectedAya | null,
  (next: SelectedAya | null) => void,
] {
  const [value, setValue] = useStateSafe<SelectedAya | null>(null);
  return [value, setValue];
}
function useStateSafe<T>(initial: T) {
  return useState<T>(initial);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  center: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80,
    gap: 24,
  },
  surahBlock: {
    gap: 8,
  },
  error: {
    textAlign: 'center',
  },
});
