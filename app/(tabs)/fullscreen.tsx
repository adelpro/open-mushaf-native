import { Animated, StyleSheet, TouchableOpacity } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";

export default function AboutScreen() {
  const [isLateralMenuShown, setIsLateralMenuShown] = useState<boolean>(false);
  const [isTopMenuShown, setIsTopMenuShown] = useState<boolean>(false);
  const [animation] = useState(new Animated.Value(0));

  const toggleLateralMenu = () => {
    Animated.timing(animation, {
      toValue: isLateralMenuShown ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      setIsLateralMenuShown((prev) => !prev);
    });
  };

  const menuTranslateX = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [250, 0], // Fully move the menu off-screen
  });

  useEffect(() => {
    if (!isTopMenuShown) return;

    const timer = setTimeout(() => {
      setIsTopMenuShown(false);
    }, 3000);

    return () => {
      clearTimeout(timer);
    };
  }, [isTopMenuShown]);

  return (
    <SafeAreaView style={styles.container}>
      {isTopMenuShown && (
        <ThemedView style={styles.topMenu}>
          <TouchableOpacity
            style={styles.topMenuButton}
            onPress={() => {
              setIsTopMenuShown(false);
              toggleLateralMenu();
            }}
          >
            <Ionicons name="menu" size={60} color={"rgba(0, 0, 0, 0.8)"} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.topMenuButton}
            onPress={() => {
              setIsTopMenuShown(false);
              alert("Search pressed");
            }}
          >
            <Ionicons name="search" size={60} color={"rgba(0, 0, 0, 0.8)"} />
          </TouchableOpacity>
        </ThemedView>
      )}
      <TouchableOpacity
        style={styles.content}
        onPress={() => setIsTopMenuShown(true)}
        onLongPress={() => alert("Long press on content")}
      >
        <ThemedView>
          <ThemedText type="default">Fullscreen page content</ThemedText>
        </ThemedView>
      </TouchableOpacity>
      {isLateralMenuShown && (
        <TouchableOpacity
          style={styles.lateralMenuBackdrop}
          onPress={toggleLateralMenu}
        />
      )}
      <Animated.View
        style={[
          styles.lateralMenu,
          { transform: [{ translateX: menuTranslateX }] },
        ]}
      >
        <TouchableOpacity style={styles.lateralMenuItemContainer}>
          <ThemedView style={styles.lateralMenuItem}>
            <ThemedText type="default" style={styles.lateralMenuItemText}>
              المصحف
            </ThemedText>
            <Ionicons
              name="chevron-forward"
              size={24}
              color={"rgba(0, 0, 0, 0.8)"}
            />
          </ThemedView>
        </TouchableOpacity>
        <TouchableOpacity style={styles.lateralMenuItemContainer}>
          <ThemedView style={styles.lateralMenuItem}>
            <ThemedText type="default" style={styles.lateralMenuItemText}>
              فهرس السور
            </ThemedText>
            <Ionicons
              name="chevron-forward"
              size={24}
              color={"rgba(0, 0, 0, 0.8)"}
            />
          </ThemedView>
        </TouchableOpacity>
        <TouchableOpacity style={styles.lateralMenuItemContainer}>
          <ThemedView style={styles.lateralMenuItem}>
            <ThemedText type="default" style={styles.lateralMenuItemText}>
              فهرس الأجزاء
            </ThemedText>
            <Ionicons
              name="chevron-forward"
              size={24}
              color={"rgba(0, 0, 0, 0.8)"}
            />
          </ThemedView>
        </TouchableOpacity>
        <TouchableOpacity style={styles.lateralMenuItemContainer}>
          <ThemedView style={styles.lateralMenuItem}>
            <ThemedText type="default" style={styles.lateralMenuItemText}>
              حول التطبيق
            </ThemedText>
            <Ionicons
              name="chevron-forward"
              size={24}
              color={"rgba(0, 0, 0, 0.8)"}
            />
          </ThemedView>
        </TouchableOpacity>
        <TouchableOpacity style={styles.lateralMenuItemContainer}>
          <ThemedView style={styles.lateralMenuItem}>
            <ThemedText type="default" style={styles.lateralMenuItemText}>
              الإعدادات
            </ThemedText>
            <Ionicons
              name="chevron-forward"
              size={24}
              color={"rgba(0, 0, 0, 0.8)"}
            />
          </ThemedView>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topMenu: {
    backgroundColor: "rgba(0, 0, 0, 0.01)",
    marginVertical: 10,
    height: 60,
    borderRadius: 5,
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    zIndex: 2,
  },
  topMenuButton: {
    marginHorizontal: 10,
    padding: 10,
  },
  container: {
    position: "relative",
    flex: 1,
  },
  content: {
    flex: 1,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  lateralMenu: {
    backgroundColor: "rgba(0, 0, 0, 0.8)", // Dark background for better visibility
    paddingVertical: 20,
    height: "100%",
    width: 250,
    position: "absolute",
    top: 0,
    right: 0,
    zIndex: 3,
  },
  lateralMenuBackdrop: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 2,
  },
  lateralMenuItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    // change text color to white and bold
    color: "white",
    fontWeight: "bold",
  },
  lateralMenuItemContainer: {
    width: "100%",
  },
  lateralMenuItemText: {
    color: "white",
    fontWeight: "bold",
  },
});
