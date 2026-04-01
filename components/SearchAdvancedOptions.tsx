import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Feather } from '@expo/vector-icons';

import { SearchOptions } from '@/types';

import { ThemedButton } from './ThemedButton';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface SearchAdvancedOptionsProps {
  advancedOptions: SearchOptions;
  toggleOption: (_option: keyof SearchOptions) => void;
}

export function SearchAdvancedOptions({
  advancedOptions,
  toggleOption,
}: SearchAdvancedOptionsProps) {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <ThemedView style={styles.container}>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>
                إرشادات البحث المتقدم
              </ThemedText>
            </View>

            <ScrollView
              style={styles.modalBody}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.helpItem}>
                <View style={styles.helpIconContainer}>
                  <Feather name="hash" size={16} color="#1976d2" />
                </View>
                <View style={styles.helpTextContainer}>
                  <ThemedText style={styles.helpTitle}>
                    النطاق (Range)
                  </ThemedText>
                  <ThemedText style={styles.helpDesc}>
                    اكتب 2:255 أو 1:1-7 للبحث في آيات محددة.
                  </ThemedText>
                </View>
              </View>

              <View style={styles.helpItem}>
                <View style={styles.helpIconContainer}>
                  <Feather name="git-branch" size={16} color="#1976d2" />
                </View>
                <View style={styles.helpTextContainer}>
                  <ThemedText style={styles.helpTitle}>
                    المنطق (Logic)
                  </ThemedText>
                  <ThemedText style={styles.helpDesc}>
                    + (إجباري)، - (مستبعد)، | (أو) مثل: +موسى -فرعون.
                  </ThemedText>
                </View>
              </View>

              <View style={styles.helpItem}>
                <View style={styles.helpIconContainer}>
                  <Feather name="code" size={16} color="#d32f2f" />
                </View>
                <View style={styles.helpTextContainer}>
                  <ThemedText style={styles.helpTitle}>
                    النمط (Regex)
                  </ThemedText>
                  <ThemedText style={styles.helpDesc}>
                    فعّل زر Regex للبحث المتقدم بالتعابير النمطية. (يلغي تفعيل
                    الخيارات الأخرى)
                  </ThemedText>
                  <View style={styles.exampleBox}>
                    <ThemedText style={styles.exampleText}>
                      مثال: ^الحمد لله.*العالمين$
                    </ThemedText>
                  </View>
                </View>
              </View>

              <View style={styles.helpItem}>
                <View style={styles.helpIconContainer}>
                  <Feather name="book-open" size={16} color="#1976d2" />
                </View>
                <View style={styles.helpTextContainer}>
                  <ThemedText style={styles.helpTitle}>
                    الدلالة (Semantic)
                  </ThemedText>
                  <ThemedText style={styles.helpDesc}>
                    فعّل زر الدلالي للبحث بالمعاني المتقاربة.
                  </ThemedText>
                </View>
              </View>

              <View style={styles.helpItem}>
                <View style={styles.helpIconContainer}>
                  <Feather name="type" size={16} color="#1976d2" />
                </View>
                <View style={styles.helpTextContainer}>
                  <ThemedText style={styles.helpTitle}>
                    الإنجليزية (English)
                  </ThemedText>
                  <ThemedText style={styles.helpDesc}>
                    اكتب بالإنجليزية بالصوتيات (Bismillah) أو بالمعنى
                    (Paradise).
                  </ThemedText>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <ThemedButton
                variant="primary"
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                حسناً
              </ThemedButton>
            </View>
          </ThemedView>
        </View>
      </Modal>

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Feather name="search" size={16} color="#1976d2" />
          <ThemedText style={styles.headerTitle}>خيارات البحث</ThemedText>
        </View>
        <Pressable
          onPress={() => setModalVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="إرشادات البحث"
          hitSlop={8}
        >
          <Feather name="info" size={20} color="#1976d2" />
        </Pressable>
      </View>

      <View style={styles.section}>
        <View style={styles.optionsRow}>
          <Pressable
            style={[
              styles.optionButton,
              advancedOptions.lemma && styles.optionActive,
              advancedOptions.isRegex && styles.optionDisabled,
            ]}
            onPress={() => !advancedOptions.isRegex && toggleOption('lemma')}
            disabled={advancedOptions.isRegex}
          >
            <ThemedText
              style={[
                advancedOptions.lemma && styles.optionActiveText,
                advancedOptions.isRegex && styles.optionDisabledText,
              ]}
            >
              الصيغة
            </ThemedText>
          </Pressable>

          <Pressable
            style={[
              styles.optionButton,
              advancedOptions.root && styles.optionActive,
              advancedOptions.isRegex && styles.optionDisabled,
            ]}
            onPress={() => !advancedOptions.isRegex && toggleOption('root')}
            disabled={advancedOptions.isRegex}
          >
            <ThemedText
              style={[
                advancedOptions.root && styles.optionActiveText,
                advancedOptions.isRegex && styles.optionDisabledText,
              ]}
            >
              الجذر
            </ThemedText>
          </Pressable>

          <Pressable
            style={[
              styles.optionButton,
              advancedOptions.fuzzy && styles.optionActive,
              advancedOptions.isRegex && styles.optionDisabled,
            ]}
            onPress={() => !advancedOptions.isRegex && toggleOption('fuzzy')}
            disabled={advancedOptions.isRegex}
          >
            <ThemedText
              style={[
                advancedOptions.fuzzy && styles.optionActiveText,
                advancedOptions.isRegex && styles.optionDisabledText,
              ]}
            >
              التقريب
            </ThemedText>
          </Pressable>

          <Pressable
            style={[
              styles.optionButton,
              advancedOptions.semantic && styles.optionActive,
              advancedOptions.isRegex && styles.optionDisabled,
            ]}
            onPress={() => !advancedOptions.isRegex && toggleOption('semantic')}
            disabled={advancedOptions.isRegex}
          >
            <ThemedText
              style={[
                advancedOptions.semantic && styles.optionActiveText,
                advancedOptions.isRegex && styles.optionDisabledText,
              ]}
            >
              دلالي
            </ThemedText>
          </Pressable>
        </View>

        <View style={styles.divider} />

        <View style={styles.regexContainer}>
          <Pressable
            style={[
              styles.regexButton,
              advancedOptions.isRegex && styles.regexActive,
            ]}
            onPress={() => toggleOption('isRegex')}
          >
            <Feather
              name="code"
              size={16}
              color={advancedOptions.isRegex ? '#fff' : '#d32f2f'}
            />
            <ThemedText
              style={[
                styles.regexText,
                advancedOptions.isRegex && styles.regexActiveText,
              ]}
            >
              Regex (تعابير نمطية)
            </ThemedText>
          </Pressable>
          <ThemedText style={styles.regexHint}>
            يلغي تفعيل الخيارات الأخرى
          </ThemedText>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976d2',
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  optionActive: {
    backgroundColor: '#e3f2fd',
    borderColor: '#1976d2',
  },
  optionDisabled: {
    opacity: 0.5,
    backgroundColor: '#f5f5f5',
    borderColor: '#eee',
  },
  optionActiveText: {
    color: '#1976d2',
    fontWeight: '600',
    fontSize: 13,
  },
  optionDisabledText: {
    color: '#999',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    marginVertical: 16,
  },
  regexContainer: {
    alignItems: 'center',
    gap: 8,
  },
  regexButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#d32f2f',
    backgroundColor: '#fff',
  },
  regexActive: {
    backgroundColor: '#d32f2f',
  },
  regexText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#d32f2f',
  },
  regexActiveText: {
    color: '#fff',
  },
  regexHint: {
    fontSize: 11,
    color: '#666',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#f8f9fa',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'left', // requested by user
  },
  modalBody: {
    padding: 20,
  },
  helpItem: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  helpIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f4f8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  helpTextContainer: {
    flex: 1,
  },
  helpTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    textAlign: 'left',
  },
  helpDesc: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    textAlign: 'left',
  },
  exampleBox: {
    marginTop: 8,
    backgroundColor: '#fef2f2',
    padding: 8,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#ef4444',
  },
  exampleText: {
    fontSize: 13,
    color: '#b91c1c',
    fontFamily: 'monospace',
    textAlign: 'left',
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center',
  },
  closeButton: {
    minWidth: 120,
    width: '50%',
  },
});
