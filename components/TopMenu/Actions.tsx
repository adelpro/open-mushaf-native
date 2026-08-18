/**
 * Compact action row for TopMenu: daily progress, navigation, search, fullscreen.
 *
 * Used by `components/TopMenu/TopMenuBar.tsx`.
 */
import React from 'react';
import { View } from 'react-native';

import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAtom, useSetAtom } from 'jotai/react';
import * as Progress from 'react-native-progress';

import { bottomMenuState, topMenuState } from '@/jotai/atoms';

import { ActionButton } from './ActionButton';
import { styles } from './styles';
import { TopMenuTheme } from './theme';
import { useDailyProgress } from './useDailyProgress';

const ICON_SIZE = 20;
const PROGRESS_SIZE = 22;

interface SharedActionProps {
  compact: boolean;
  theme: TopMenuTheme;
}

interface TopMenuActionsProps extends SharedActionProps {
  isTemporary: boolean;
}

function useDismissTopMenu() {
  return useSetAtom(topMenuState);
}

export function TopMenuActions(props: TopMenuActionsProps) {
  const { isTemporary, compact, theme } = props;

  return (
    <View style={styles.actionsSection}>
      {!isTemporary && <ProgressAction compact={compact} theme={theme} />}
      <NavigationAction compact={compact} theme={theme} />
      <SearchAction compact={compact} theme={theme} />
      <FullscreenAction compact={compact} theme={theme} />
    </View>
  );
}

function ProgressAction(props: SharedActionProps) {
  const { compact, theme } = props;
  const progressValue = useDailyProgress();
  const dismiss = useDismissTopMenu();

  return (
    <ActionButton
      label="التقدم"
      accessibilityLabel="الورد اليومي"
      accessibilityHint="اضغط لفتح متتبع الورد اليومي"
      onPress={() => {
        dismiss(false);
        router.push('/tracker');
      }}
      iconBackground={theme.actionIconBackground}
      labelColor={theme.actionLabelColor}
      compact={compact}
    >
      <View style={styles.progressContainer}>
        <Progress.Circle
          size={PROGRESS_SIZE}
          progress={progressValue}
          color={theme.iconColor}
          showsText={false}
          thickness={3}
          borderWidth={0}
          unfilledColor={theme.progressTrack}
        />
        {progressValue === 1 && (
          <View style={styles.checkmarkContainer}>
            <Feather name="check" size={12} color={theme.iconColor} />
          </View>
        )}
      </View>
    </ActionButton>
  );
}

function NavigationAction(props: SharedActionProps) {
  const { compact, theme } = props;
  const dismiss = useDismissTopMenu();

  return (
    <ActionButton
      label="انتقال"
      accessibilityLabel="التنقل"
      accessibilityHint="اضغط لفتح صفحة التنقل بين السور والأجزاء"
      onPress={() => {
        dismiss(false);
        router.push('/navigation');
      }}
      iconBackground={theme.actionIconBackground}
      labelColor={theme.actionLabelColor}
      compact={compact}
    >
      <Ionicons
        name="navigate-circle-outline"
        size={ICON_SIZE}
        color={theme.iconColor}
      />
    </ActionButton>
  );
}

function SearchAction(props: SharedActionProps) {
  const { compact, theme } = props;
  const dismiss = useDismissTopMenu();

  return (
    <ActionButton
      label="بحث"
      accessibilityLabel="البحث"
      accessibilityHint="اضغط لفتح صفحة البحث في القرآن"
      onPress={() => {
        dismiss(false);
        router.push('/search');
      }}
      iconBackground={theme.actionIconBackground}
      labelColor={theme.actionLabelColor}
      compact={compact}
    >
      <Ionicons name="search" size={ICON_SIZE} color={theme.iconColor} />
    </ActionButton>
  );
}

function FullscreenAction(props: SharedActionProps) {
  const { compact, theme } = props;
  const dismiss = useDismissTopMenu();
  const [showBottomMenu, setBottomMenu] = useAtom(bottomMenuState);
  const fullscreenLabel = showBottomMenu ? 'وضع ملء الشاشة' : 'إظهار القائمة';

  return (
    <ActionButton
      label="تكبير"
      accessibilityLabel={fullscreenLabel}
      accessibilityState={{ expanded: showBottomMenu }}
      onPress={() => {
        dismiss(false);
        setBottomMenu((state) => !state);
      }}
      iconBackground={theme.actionIconBackground}
      labelColor={theme.actionLabelColor}
      compact={compact}
    >
      <FullscreenIcon expanded={showBottomMenu} color={theme.iconColor} />
    </ActionButton>
  );
}

interface FullscreenIconProps {
  expanded: boolean;
  color: string;
}

function FullscreenIcon(props: FullscreenIconProps) {
  const { expanded, color } = props;
  if (expanded) {
    return (
      <MaterialCommunityIcons
        name="fit-to-screen-outline"
        size={ICON_SIZE}
        color={color}
      />
    );
  }
  return (
    <MaterialIcons name="fullscreen-exit" size={ICON_SIZE} color={color} />
  );
}
