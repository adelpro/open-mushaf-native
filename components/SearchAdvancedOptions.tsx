import { useState } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';

import { Feather } from '@expo/vector-icons';

import { useColors } from '@/hooks';
import { SearchOptions } from '@/types';

import { styles } from './SearchAdvancedOptions.styles';
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
  const { cardColor, iconColor, textColor } = useColors();

  // The pill surface must follow the theme; a hardcoded white background left the
  // themed label text invisible in dark mode.
  const themedOption = {
    backgroundColor: cardColor,
    borderColor: iconColor,
  };

  function renderHelpItem() {
    return (
      <View style={styles.helpItem}>
        <View style={styles.helpIconContainer}>
          <Feather name="code" size={16} color="#d32f2f" />
        </View>
        <View style={styles.helpTextContainer}>
          <ThemedText style={styles.helpTitle}>النمط (Regex)</ThemedText>
          <ThemedText style={styles.helpDesc}>
            فعّل زر Regex للبحث المتقدم بالتعابير النمطية. (يلغي تفعيل الخيارات
            الأخرى)
          </ThemedText>
          <View style={styles.exampleBox}>
            <ThemedText style={styles.exampleText}>
              مثال: ^الحمد لله.*العالمين$
            </ThemedText>
          </View>
        </View>
      </View>
    );
  }

  function renderOptionButton() {
    return (
      <Pressable
        style={[
          styles.optionButton,
          themedOption,
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
    );
  }

  function renderOptionButton2() {
    return (
      <Pressable
        style={[
          styles.optionButton,
          themedOption,
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
    );
  }

  function renderOptionsRow() {
    function renderOptionButton3() {
      return (
        <Pressable
          style={[
            styles.optionButton,
            themedOption,
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
      );
    }

    function renderOptionButton4() {
      return (
        <Pressable
          style={[
            styles.optionButton,
            themedOption,
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
      );
    }
    return (
      <View style={styles.optionsRow}>
        {renderOptionButton()}

        {renderOptionButton2()}

        {renderOptionButton3()}

        {renderOptionButton4()}
      </View>
    );
  }

  function renderSection() {
    function renderRegexContainer() {
      function renderRegexButton() {
        return (
          <Pressable
            style={[
              styles.regexButton,
              { backgroundColor: cardColor },
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
        );
      }
      return (
        <View style={styles.regexContainer}>
          {renderRegexButton()}
          <ThemedText style={[styles.regexHint, { color: textColor }]}>
            يلغي تفعيل الخيارات الأخرى
          </ThemedText>
        </View>
      );
    }
    return (
      <View style={styles.section}>
        {renderOptionsRow()}

        <View style={styles.divider} />

        {renderRegexContainer()}
      </View>
    );
  }

  function renderModal() {
    function renderModalOverlay() {
      function renderModalContent() {
        function renderModalBody() {
          function renderHelpItem2() {
            return (
              <SearchHelpItem
                icon="type"
                title="الإنجليزية (English)"
                description="اكتب بالإنجليزية بالصوتيات (Bismillah) أو بالمعنى (Paradise)."
              />
            );
          }
          return (
            <ScrollView
              style={styles.modalBody}
              showsVerticalScrollIndicator={false}
            >
              <SearchHelpItem
                icon="hash"
                title="النطاق (Range)"
                description="اكتب 2:255 أو 1:1-7 للبحث في آيات محددة."
              />

              <SearchHelpItem
                icon="git-branch"
                title="المنطق (Logic)"
                description="+ (إجباري)، - (مستبعد)، | (أو) مثل: +موسى -فرعون."
              />

              {renderHelpItem()}

              <SearchHelpItem
                icon="book-open"
                title="الدلالة (Semantic)"
                description="فعّل زر الدلالي للبحث بالمعاني المتقاربة."
              />

              {renderHelpItem2()}
            </ScrollView>
          );
        }
        return (
          <ThemedView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>
                إرشادات البحث المتقدم
              </ThemedText>
            </View>

            {renderModalBody()}

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
        );
      }
      return <View style={styles.modalOverlay}>{renderModalContent()}</View>;
    }
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        {renderModalOverlay()}
      </Modal>
    );
  }

  function renderHeader() {
    return (
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
    );
  }
  return (
    <ThemedView style={styles.container}>
      {renderModal()}

      {renderHeader()}

      {renderSection()}
    </ThemedView>
  );
}

function SearchHelpItem(props: {
  icon: React.ComponentProps<typeof Feather>['name'];
  title: string;
  description: string;
}) {
  return (
    <View style={styles.helpItem}>
      <View style={styles.helpIconContainer}>
        <Feather name={props.icon} size={16} color="#1976d2" />
      </View>
      <View style={styles.helpTextContainer}>
        <ThemedText style={styles.helpTitle}>{props.title}</ThemedText>
        <ThemedText style={styles.helpDesc}>{props.description}</ThemedText>
      </View>
    </View>
  );
}
