import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    margin: 5,
  },
  scroll: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    marginStart: 10,
    alignSelf: 'flex-start',
  },
  input: {
    padding: 10,
    marginBottom: 15,
    width: '100%',
    marginHorizontal: 10,
    textAlign: 'right',
  },
  messageInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  disabledButton: {
    backgroundColor: '#999',
  },
});
