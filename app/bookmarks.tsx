import React, { useState } from 'react';
import {
  FlatList,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';

import { Feather } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useAtom } from 'jotai/react';

import SEO from '@/components/seo';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColors } from '@/hooks/useColors';
import useCurrentPage from '@/hooks/useCurrentPage';
import { Bookmark, bookmarks as bookmarksAtom } from '@/jotai/atoms';

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

  const renderBookmark = ({ item }: { item: Bookmark }) => (
    <ThemedView style={[styles.bookmarkItem, { backgroundColor: cardColor }]}>
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
          <ThemedText style={styles.bookmarkPage}>صفحة {item.page}</ThemedText>
        </ThemedView>
      </TouchableOpacity>
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

  return (
    <>
      <Stack.Screen options={{ title: 'العلامات المرجعية' }} />
      <SEO
        title="العلامات المرجعية - المصحف المفتوح"
        description="إدارة العلامات المرجعية في المصحف"
      />
      <ThemedView style={styles.container}>
        <ThemedButton
          variant="primary"
          onPress={() => setAddModalVisible(true)}
          style={styles.addButton}
        >
          <ThemedView style={styles.addButtonContent}>
            <Feather name="plus" size={20} />
            <ThemedText style={styles.addButtonText}>
              إضافة علامة (صفحة {currentPage})
            </ThemedText>
          </ThemedView>
        </ThemedButton>

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

        {/* Add Bookmark Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={addModalVisible}
          onRequestClose={() => setAddModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setAddModalVisible(false)}
          >
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
            </ThemedView>
          </TouchableOpacity>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={deleteModalVisible}
          onRequestClose={() => setDeleteModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setDeleteModalVisible(false)}
          >
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
                هل تريد حذف "{selectedBookmark?.label}"؟
              </ThemedText>

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
            </ThemedView>
          </TouchableOpacity>
        </Modal>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
    alignSelf: 'center',
    width: '100%',
    maxWidth: 640,
  },
  addButton: {
    width: '100%',
    marginBottom: 16,
  },
  addButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontFamily: 'Tajawal_400Regular',
  },
  list: {
    width: '100%',
  },
  bookmarkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    elevation: 2,
  },
  bookmarkContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bookmarkIcon: {
    marginEnd: 12,
  },
  bookmarkTextContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  bookmarkLabel: {
    fontSize: 16,
    fontFamily: 'Tajawal_700Bold',
  },
  bookmarkPage: {
    fontSize: 13,
    fontFamily: 'Tajawal_400Regular',
    opacity: 0.7,
  },
  deleteButton: {
    padding: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: 'Tajawal_700Bold',
    marginTop: 16,
  },
  emptyHint: {
    fontSize: 14,
    fontFamily: 'Tajawal_400Regular',
    marginTop: 8,
    opacity: 0.6,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 20,
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 12,
    padding: 16,
    elevation: 5,
    alignSelf: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    minHeight: 40,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Tajawal_700Bold',
  },
  closeButton: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: 'Tajawal_400Regular',
  },
  labelInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Tajawal_400Regular',
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'transparent',
    width: '100%',
  },
  modalButton: {
    width: '40%',
    maxWidth: 120,
  },
});
