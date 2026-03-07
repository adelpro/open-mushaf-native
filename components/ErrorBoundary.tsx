import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  Appearance,
  DevSettings,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';
import * as Updates from 'expo-updates';

import { Colors } from '@/constants';
import { logError } from '@/utils/errorLogger';

import { ThemedButton } from './ThemedButton';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (resetError: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logError(error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  resetError = async (): Promise<void> => {
    try {
      if (__DEV__) {
        DevSettings.reload();
      } else {
        await Updates.reloadAsync();
      }
    } catch {
      this.setState({ hasError: false, error: null });
    }
  };

  private get colors() {
    const scheme = Appearance.getColorScheme() ?? 'light';
    return Colors[scheme];
  }

  renderDefaultFallback(): ReactNode {
    const { error } = this.state;
    const colors = this.colors;

    const styles = StyleSheet.create({
      container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 28,
        backgroundColor: colors.background,
      },
      iconContainer: {
        marginBottom: 24,
      },
      title: {
        fontSize: 28,
        fontFamily: 'Tajawal_700Bold',
        color: colors.text,
        marginBottom: 12,
        writingDirection: 'rtl',
        textAlign: 'center',
      },
      subtitle: {
        fontSize: 16,
        fontFamily: 'Tajawal_400Regular',
        color: colors.icon,
        marginBottom: 32,
        lineHeight: 24,
        writingDirection: 'rtl',
        textAlign: 'center',
      },
      errorDetails: {
        width: '100%',
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 32,
        borderWidth: 1,
        borderColor: colors.dangerLight,
      },
      errorLabel: {
        fontSize: 14,
        fontFamily: 'Tajawal_500Medium',
        color: colors.danger,
        marginBottom: 8,
        writingDirection: 'rtl',
      },
      errorMessage: {
        fontSize: 13,
        fontFamily: 'Tajawal_400Regular',
        color: colors.text,
        marginBottom: 8,
        writingDirection: 'rtl',
      },
      errorStackContainer: {
        maxHeight: 180,
      },
      errorStack: {
        fontSize: 11,
        color: colors.icon,
        fontFamily: 'monospace',
      },
      retryButtonText: {
        fontSize: 17,
        fontFamily: 'Tajawal_700Bold',
        letterSpacing: 0.5,
      },
    });

    return (
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <Ionicons name="book-outline" size={80} color={colors.danger} />
        </View>

        <Text style={styles.title}>عذراً، حدث انقطاع بسيط</Text>

        <Text style={styles.subtitle}>
          واجهنا مشكلة تقنية تعيق عرض الصفحة. يرجى إعادة المحاولة للمتابعة.
        </Text>

        {__DEV__ && error && (
          <View style={styles.errorDetails}>
            <Text style={styles.errorLabel}>تفاصيل الخطأ (وضع التطوير):</Text>
            <Text style={styles.errorMessage}>{error.message}</Text>
            {error.stack && (
              <ScrollView style={styles.errorStackContainer}>
                <Text style={styles.errorStack}>{error.stack}</Text>
              </ScrollView>
            )}
          </View>
        )}

        <ThemedButton
          onPress={this.resetError}
          variant="primary"
          accessibilityRole="button"
          accessibilityLabel="إعادة المحاولة"
        >
          <Text style={styles.retryButtonText}>إعادة المحاولة</Text>
        </ThemedButton>
      </View>
    );
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback
        ? this.props.fallback(this.resetError)
        : this.renderDefaultFallback();
    }

    return this.props.children;
  }
}
