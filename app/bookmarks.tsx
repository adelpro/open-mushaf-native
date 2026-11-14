import { useState } from 'react';
import { FlatList, Modal, TextInput, TouchableOpacity } from 'react-native';

import { Feather } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useAtom } from 'jotai/react';

import { Seo, ThemedButton, ThemedText, ThemedView } from '@/components';
import { useColors, useCurrentPage } from '@/hooks';
import { Bookmark, bookmarks as bookmarksAtom } from '@/jotai/atoms';
import { styles } from '@/styles/screens/bookmarks.styles';

export default function BookmarksScreen() {
  const router = useRouter();
  const { iconColor, cardColor, primaryColor, textColor } = useColors();
  const { currentPage } = useCurrentPage();
  const [bookmarksList, setBookmarksList] = useAtom(bookmarksAtom);

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedBookmark, setSelectedBookmark] = useState<Bookmark | null>(
    null,
  );
  const [newLabel, setNewLabel] = useState('');

  const addBookmark = () => {
    const bookmark: Bookmark = {
      id: Date.now().toString(),
      page: currentPage,
      label: newLabel.trim() || `صفحة ${currentPage}`,
      createdAt: new Date().toISOString(),
    };
    setBookmarksList((prev) => [...prev, bookmark]);
    setNewLabel('');
    setAddModalVisible(false);
  };

  const removeBookmark = (id: string) => {
    setBookmarksList((prev) => prev.filter((b) => b.id !== id));
    setDeleteModalVisible(false);
    setSelectedBookmark(null);
  };

  const navigateToBookmark = (page: number) => {
    router.push({
      pathname: '/',
      params: { page: page.toString(), temporary: 'true' },
    });
  };

  const renderBookmark = ({ item }: { item: Bookmark }) => {
    function renderBookmarkContent() {
      return (
        <TouchableOpacity
          style={styles.bookmarkContent}
          onPress={() => navigateToBookmark(item.page)}
          accessibilityRole="button"
          accessibilityLabel={`الانتقال إلى ${item.label}`}
        >
          <Feather
            name="bookmark"
            size={20}
            color={primaryColor}
            style={styles.bookmarkIcon}
          />
          <ThemedView style={styles.bookmarkTextContainer}>
            <ThemedText style={styles.bookmarkLabel}>{item.label}</ThemedText>
            <ThemedText style={styles.bookmarkPage}>
              صفحة {item.page}
            </ThemedText>
          </ThemedView>
        </TouchableOpacity>
      );
    }
    return (
      <ThemedView style={[styles.bookmarkItem, { backgroundColor: cardColor }]}>
        {renderBookmarkContent()}
        <TouchableOpacity
          onPress={() => {
            setSelectedBookmark(item);
            setDeleteModalVisible(true);
          }}
          accessibilityRole="button"
          accessibilityLabel={`حذف ${item.label}`}
          style={styles.deleteButton}
        >
          <Feather name="trash-2" size={18} color="#C62828" />
        </TouchableOpacity>
      </ThemedView>
    );
  };

  function renderModalOverlay() {
    function renderModalContent() {
      function renderModalActions() {
        return (
          <ThemedView style={styles.modalActions}>
            <ThemedButton
              variant="outlined-primary"
              onPress={() => setDeleteModalVisible(false)}
              style={styles.modalButton}
            >
              إلغاء
            </ThemedButton>
            <ThemedButton
              variant="danger"
              onPress={() =>
                selectedBookmark && removeBookmark(selectedBookmark.id)
              }
              style={styles.modalButton}
            >
              حذف
            </ThemedButton>
          </ThemedView>
        );
      }
      return (
        <ThemedView
          style={[styles.modalContent, { backgroundColor: cardColor }]}
          onStartShouldSetResponder={() => true}
        >
          <ThemedView style={styles.modalHeader}>
            <ThemedText style={styles.modalTitle}>تأكيد الحذف</ThemedText>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setDeleteModalVisible(false)}
              accessibilityRole="button"
              accessibilityLabel="إغلاق"
            >
              <Feather name="x" size={24} color={iconColor} />
            </TouchableOpacity>
          </ThemedView>

          <ThemedText style={styles.modalMessage}>
            هل تريد حذف &quot;{selectedBookmark?.label}&quot;؟
          </ThemedText>

          {renderModalActions()}
        </ThemedView>
      );
    }
    return (
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setDeleteModalVisible(false)}
      >
        {renderModalContent()}
      </TouchableOpacity>
    );
  }

  function renderContainer() {
    function renderModal() {
      function renderModalOverlay2() {
        function renderModalContent2() {
          function renderModalActions2() {
            return (
              <ThemedView style={styles.modalActions}>
                <ThemedButton
                  variant="outlined-primary"
                  onPress={() => setAddModalVisible(false)}
                  style={styles.modalButton}
                >
                  إلغاء
                </ThemedButton>
                <ThemedButton
                  variant="primary"
                  onPress={addBookmark}
                  style={styles.modalButton}
                >
                  حفظ
                </ThemedButton>
              </ThemedView>
            );
          }
          return (
            <ThemedView
              style={[styles.modalContent, { backgroundColor: cardColor }]}
              onStartShouldSetResponder={() => true}
            >
              <ThemedView style={styles.modalHeader}>
                <ThemedText style={styles.modalTitle}>
                  إضافة علامة مرجعية
                </ThemedText>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setAddModalVisible(false)}
                  accessibilityRole="button"
                  accessibilityLabel="إغلاق"
                >
                  <Feather name="x" size={24} color={iconColor} />
                </TouchableOpacity>
              </ThemedView>

              <ThemedText style={styles.modalMessage}>
                صفحة {currentPage}
              </ThemedText>

              <TextInput
                style={[
                  styles.labelInput,
                  { color: textColor, borderColor: primaryColor },
                ]}
                placeholder="اسم العلامة (اختياري)"
                placeholderTextColor={iconColor}
                value={newLabel}
                onChangeText={setNewLabel}
                textAlign="right"
              />

              {renderModalActions2()}
            </ThemedView>
          );
        }
        return (
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setAddModalVisible(false)}
          >
            {renderModalContent2()}
          </TouchableOpacity>
        );
      }
      return (
        <Modal
          animationType="fade"
          transparent={true}
          visible={addModalVisible}
          onRequestClose={() => setAddModalVisible(false)}
        >
          {renderModalOverlay2()}
        </Modal>
      );
    }

    function renderList() {
      return (
        <FlatList
          data={bookmarksList}
          renderItem={renderBookmark}
          keyExtractor={(item) => item.id}
          style={styles.list}
          ListEmptyComponent={
            <ThemedView style={styles.emptyContainer}>
              <Feather name="bookmark" size={48} color={iconColor} />
              <ThemedText style={styles.emptyText}>
                لا توجد علامات مرجعية
              </ThemedText>
              <ThemedText style={styles.emptyHint}>
                اضغط الزر أعلاه لإضافة علامة للصفحة الحالية
              </ThemedText>
            </ThemedView>
          }
        />
      );
    }
    return (
      <ThemedView style={styles.container}>
        <ThemedButton
          variant="primary"
          onPress={() => setAddModalVisible(true)}
          style={styles.addButton}
        >
          <ThemedView style={styles.addButtonContent}>
            <Feather name="plus" size={20} color="white" />
            <ThemedText style={styles.addButtonText}>
              إضافة علامة (صفحة {currentPage})
            </ThemedText>
          </ThemedView>
        </ThemedButton>

        {renderList()}

        {/* Add Bookmark Modal */}
        {renderModal()}

        {/* Delete Confirmation Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={deleteModalVisible}
          onRequestClose={() => setDeleteModalVisible(false)}
        >
          {renderModalOverlay()}
        </Modal>
      </ThemedView>
    );
  }
  return (
    <>
      <Stack.Screen options={{ title: 'العلامات المرجعية' }} />
      <Seo
        title="العلامات المرجعية - المصحف المفتوح"
        description="إدارة العلامات المرجعية في المصحف"
      />
      {renderContainer()}
    </>
  );
}
