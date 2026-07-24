/**
 * First-launch wizard for the open-mushaf app's qurani.ai integration.
 *
 * Steps:
 *  1. Pick a riwaya from the 5 supported editions.
 *  2. Download the per-narration Quran text bundle from qurani.ai
 *     (~2 MB) and persist it under
 *     `Paths.document/open-mushaf/api/<riwaya>/bundle.json`.
 *  3. Persist `firstLaunchDone=true` and `lastSelectedRiwaya`, then
 *     replace the wizard with the home tabs.
 *
 * Navigation happens once from the successful download handler. The
 * wizard does not redirect from render, so router store updates cannot
 * repeatedly trigger the same navigation while this screen unmounts.
 *
 * The wizard is shown on every install (and every reinstall) until
 * the user successfully completes a download. Re-downloading a
 * different riwaya from the Downloads page does NOT re-trigger the
 * wizard.
 */

import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { Feather } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useAtomValue, useSetAtom } from 'jotai/react';

import { ThemedText, ThemedView } from '@/components';
import { RIWAYA_ARABIC_LABEL, RIWAYAT_LIST } from '@/constants';
import { useColors, useRiwayaDownload } from '@/hooks';
import {
  firstLaunchDone,
  lastSelectedRiwaya,
  mushafRiwaya,
} from '@/jotai/atoms';
import type { Riwaya } from '@/types';

type WizardState = 'pick' | 'downloading' | 'error';

export default function FirstLaunchWizard() {
  const router = useRouter();
  const { primaryColor, dangerColor, cardColor, textColor, iconColor } =
    useColors();
  const setDone = useSetAtom(firstLaunchDone);
  const currentRiwaya = useAtomValue(mushafRiwaya);
  const setCurrentRiwaya = useSetAtom(mushafRiwaya);
  const setLastSelected = useSetAtom(lastSelectedRiwaya);
  const { startRiwaya } = useRiwayaDownload();

  const [pick, setPick] = useState<Riwaya>(
    (currentRiwaya as Riwaya | undefined) ?? 'hafs',
  );
  // The initial UI state is `'pick'` — we don't expose a `'done'`
  // local state because navigation is declarative: once the atom
  // `firstLaunchDone` flips to `true` the wizard re-renders and
  // returns `<Redirect />` from the top of the render tree.
  const [state, setState] = useState<WizardState>('pick');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const startDownload = useCallback(async () => {
    setErrorMessage(null);
    setState('downloading');

    try {
      await startRiwaya(pick);

      setCurrentRiwaya(pick);
      setLastSelected(pick);
      setDone(true);
      router.replace('/(tabs)');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
      setState('error');
    }
  }, [pick, router, startRiwaya, setCurrentRiwaya, setDone, setLastSelected]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false, title: 'إعداد المصحف' }} />
      <ThemedView style={[styles.container, { backgroundColor: cardColor }]}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <ThemedText type="title" style={styles.title}>
            مرحبًا بك في المصحف المفتوح
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            اختر الرواية التي تودّ القراءة بها، ثم نقوم بتنزيل نصّ القرآن من
            qurani.ai. تحتاج إلى اتصال بالإنترنت للجلسة الأولى فقط — القراءة بعد
            التنزيل تعمل بدون اتصال.
          </ThemedText>

          <View style={styles.riwayaList}>
            {RIWAYAT_LIST.map((riwayaId) => {
              const active = pick === riwayaId;
              return (
                <Pressable
                  key={riwayaId}
                  disabled={state === 'downloading'}
                  onPress={() => setPick(riwayaId)}
                  style={[
                    styles.riwayaCard,
                    {
                      borderColor: active ? primaryColor : textColor + '22',
                      backgroundColor: active
                        ? primaryColor + '15'
                        : 'transparent',
                    },
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                >
                  <View style={styles.riwayaCardInner}>
                    <ThemedText
                      type="defaultSemiBold"
                      style={[
                        styles.riwayaLabel,
                        active ? { color: primaryColor } : null,
                      ]}
                    >
                      {RIWAYA_ARABIC_LABEL[riwayaId]}
                    </ThemedText>
                    <Feather
                      name={active ? 'check-circle' : 'circle'}
                      size={22}
                      color={active ? primaryColor : iconColor}
                    />
                  </View>
                </Pressable>
              );
            })}
          </View>

          {state === 'downloading' ? (
            <View style={styles.progressBlock}>
              <ActivityIndicator size="large" color={primaryColor} />
              <ThemedText style={styles.progressLabel}>
                جارٍ تنزيل بيانات {RIWAYA_ARABIC_LABEL[pick]}…
              </ThemedText>
            </View>
          ) : null}

          {state === 'error' && errorMessage ? (
            <View
              style={[
                styles.errorBox,
                {
                  borderColor: dangerColor,
                  backgroundColor: dangerColor + '15',
                },
              ]}
            >
              <Feather name="alert-circle" size={20} color={dangerColor} />
              <ThemedText style={[styles.errorText, { color: dangerColor }]}>
                {errorMessage}
              </ThemedText>
            </View>
          ) : null}

          {state !== 'downloading' ? (
            <Pressable
              onPress={startDownload}
              style={[styles.cta, { backgroundColor: primaryColor }]}
              accessibilityRole="button"
              accessibilityLabel={`تنزيل بيانات ${RIWAYA_ARABIC_LABEL[pick]}`}
            >
              <Feather name="download" size={18} color="#fff" />
              <ThemedText style={styles.ctaLabel}>
                تنزيل بيانات {RIWAYA_ARABIC_LABEL[pick]}
              </ThemedText>
            </Pressable>
          ) : null}
        </ScrollView>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: 24,
    gap: 18,
    paddingBottom: 64,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 24,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.75,
  },
  riwayaList: {
    gap: 10,
  },
  riwayaCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
  },
  riwayaCardInner: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  riwayaLabel: {
    fontSize: 18,
    textAlign: 'right',
  },
  progressBlock: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
  },
  progressLabel: {
    fontSize: 14,
    opacity: 0.75,
    textAlign: 'center',
  },
  errorBox: {
    flexDirection: 'row-reverse',
    gap: 8,
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'flex-start',
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
  },
  cta: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  ctaLabel: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
