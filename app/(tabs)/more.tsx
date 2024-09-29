import { StyleSheet } from 'react-native';

import { ThemedView } from '@/components/ThemedView';

export default function AboutScreen() {
  return <ThemedView style={styles.container}></ThemedView>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainContent: {
    maxWidth: 600,
    paddingHorizontal: 22,
    alignSelf: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  listContainer: {
    marginBottom: 20,
    paddingLeft: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  bullet: {
    marginRight: 10,
    marginLeft: 5,
    fontWeight: '500',
  },
  listText: {
    fontSize: 16,
    lineHeight: 22,
  },
  link: {
    color: '#1E90FF', // Ensuring good contrast for dark mode
    textDecorationLine: 'underline',
  },
  versionText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginTop: 5,
  },
  copyright: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginTop: 10,
  },
});
