import React from 'react';
import { ActivityIndicator, Pressable } from 'react-native';

import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import HTMLView from 'react-native-htmlview';

import {
  getTafseerLabel,
  TafseerKey,
  TAFSEERS_LIST,
} from '@/constants/TafseerCdn';
import {
  hasNoTafseerContent,
  useColors,
  useDownloadStatus,
  useTafseerContent,
} from '@/hooks';
import { TafseerAya } from '@/types';

import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { styles } from './styles';

type TabProps = {
  selectedTab: TafseerKey;
  onSelect: (key: TafseerKey) => void;
  cache: ReadonlyMap<TafseerKey, TafseerAya[]>;
  surah: number;
  aya: number;
  surahName: string;
};
export function TafseerTabs(props: TabProps) {
  return (
    <ThemedView style={[styles.tabs, { backgroundColor: 'transparent' }]}>
      {TAFSEERS_LIST.map((tabKey) => (
        <TafseerTab key={tabKey} tabKey={tabKey} {...props} />
      ))}
    </ThemedView>
  );
}
function TafseerTab({
  tabKey,
  selectedTab,
  onSelect,
  cache,
  surah,
  aya,
  surahName,
}: TabProps & { tabKey: TafseerKey }) {
  const { tintColor } = useColors();
  const data = cache.get(tabKey);
  const isDisabled =
    data !== undefined &&
    hasNoTafseerContent({ tafseerData: data, surah, aya });
  const isSelected = tabKey === selectedTab;
  const label = getTafseerLabel(tabKey);
  return (
    <Pressable
      style={[
        styles.tabButton,
        isSelected && styles.activeTab,
        isSelected && { borderColor: tintColor },
        isDisabled && styles.disabledTab,
        { backgroundColor: 'transparent' },
      ]}
      onPress={() => {
        onSelect(tabKey);
      }}
      accessibilityLabel={
        label + ' tab for Surah ' + surahName + ', Aya ' + aya
      }
      accessibilityHint={
        'Tap to see the tafseer for Surah ' +
        surahName +
        ', Aya ' +
        aya +
        ' from ' +
        label
      }
      disabled={isDisabled}
    >
      <TafseerTabContent
        tabKey={tabKey}
        label={label}
        isDisabled={isDisabled}
      />
    </Pressable>
  );
}

function TafseerTabContent({
  tabKey,
  label,
  isDisabled,
}: {
  tabKey: TafseerKey;
  label: string;
  isDisabled: boolean;
}) {
  const { tintColor, primaryColor } = useColors();
  const { tafseerIsDownloaded } = useDownloadStatus();
  const isDownloaded = tafseerIsDownloaded(tabKey);
  return (
    <>
      <ThemedText
        style={[
          { color: tintColor, backgroundColor: 'transparent' },
          isDisabled && styles.disabledTabText,
        ]}
      >
        {label}
      </ThemedText>
      <Feather
        name={isDownloaded ? 'check-circle' : 'download'}
        size={11}
        color={isDownloaded ? primaryColor : tintColor + '88'}
        style={styles.tabDownloadedBadge}
      />
    </>
  );
}

type BodyProps = {
  selectedTab: TafseerKey;
  surah: number;
  aya: number;
  loading: boolean;
  error: string | null;
  tafseerData: TafseerAya[] | null;
};
export function TafseerBody({
  selectedTab,
  surah,
  aya,
  loading,
  error,
  tafseerData,
}: BodyProps) {
  const { tintColor } = useColors();
  const { tafseerIsDownloaded } = useDownloadStatus();
  const html = useTafseerContent({ tafseerData, surah, aya });
  if (loading) return <ActivityIndicator size="large" color={tintColor} />;
  if (error)
    return (
      <ThemedText style={{ color: 'red', textAlign: 'center', padding: 20 }}>
        {error}
      </ThemedText>
    );
  if (!tafseerIsDownloaded(selectedTab)) return <TafseerDownloadPrompt />;
  return tafseerData ? (
    <TafseerHtml html={html} />
  ) : (
    <ThemedText style={{ textAlign: 'center', padding: 20 }}>
      لا يوجد تفسير لهذه الآية
    </ThemedText>
  );
}
function TafseerHtml({ html }: { html: string }) {
  const { textColor } = useColors();
  const textStyle = {
    color: textColor,
    fontFamily: 'Tajawal_400Regular',
    fontSize: 16,
    lineHeight: 24,
    backgroundColor: 'transparent',
  };
  return (
    <ThemedView style={{ flex: 1 }}>
      <HTMLView
        value={html}
        style={{
          paddingHorizontal: 10,
          paddingVertical: 5,
          backgroundColor: 'transparent',
        }}
        stylesheet={{
          div: textStyle,
          p: { ...textStyle, flexDirection: 'row' },
        }}
        addLineBreaks={false}
      />
    </ThemedView>
  );
}
function TafseerDownloadPrompt() {
  const { tintColor, primaryColor } = useColors();
  return (
    <ThemedView
      style={[styles.notDownloadedCard, { borderColor: tintColor + '44' }]}
    >
      <Feather
        name="cloud-off"
        size={28}
        color={primaryColor}
        style={{ marginBottom: 6 }}
      />
      <ThemedText type="defaultSemiBold" style={{ textAlign: 'center' }}>
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
        لن يتم تنزيل هذا التفسير تلقائيًا. افتح صفحة التنزيلات لإضافته إلى
        جهازك.
      </ThemedText>
      <TafseerDownloadButton />
    </ThemedView>
  );
}
function TafseerDownloadButton() {
  const router = useRouter();
  const { primaryColor } = useColors();
  return (
    <Pressable
      onPress={() => {
        router.push('/downloads');
      }}
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
        style={[styles.notDownloadedCtaLabel, { color: primaryColor }]}
      >
        افتح التنزيلات
      </ThemedText>
    </Pressable>
  );
}
