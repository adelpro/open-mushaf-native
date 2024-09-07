import { ThemedView } from '@/components/ThemedView';
import { bottomMenuState, topMenuState } from '@/recoil/atoms';
import { Ionicons, SimpleLineIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useRecoilState, useSetRecoilState } from 'recoil';

export default function TopMenu() {
  const setMenuState = useSetRecoilState(bottomMenuState);
  const [show, setShow] = useRecoilState(topMenuState);

  const toggleMenu = () => {
    setMenuState((state: boolean) => !state);
  };

  return show ? (
    <ThemedView style={styles.topMenu}>
      <TouchableOpacity
        style={styles.topMenuButton}
        onPress={() => {
          setShow(false);
          toggleMenu();
        }}
      >
        <SimpleLineIcons
          name="size-fullscreen"
          size={40}
          color={'rgba(0, 0, 0, 0.8)'}
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.topMenuButton}
        onPress={() => {
          setShow(false);
          alert('Search pressed');
        }}
      >
        <Ionicons name="search" size={40} color={'rgba(0, 0, 0, 0.8)'} />
      </TouchableOpacity>
    </ThemedView>
  ) : null;
}
const styles = StyleSheet.create({
  topMenu: {
    backgroundColor: 'rgba(0, 0, 0, 0.01)',
    marginVertical: 10,
    height: 60,
    borderRadius: 5,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    zIndex: 2,
  },
  topMenuButton: {
    marginHorizontal: 10,
    padding: 10,
  },
});
