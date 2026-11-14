import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  scrollContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    margin: 2,
  },
  mainContent: {
    flex: 1,
    height: '100%',
    maxWidth: 600,
    paddingHorizontal: 22,
    alignSelf: 'center',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginVertical: 5,
  },
  listContainer: {
    marginBottom: 5,
    paddingLeft: 16,
    alignItems: 'flex-start',
  },
  listItem: {
    marginBottom: 10,
    flexDirection: 'row',
  },
  bullet: {
    marginStart: 10,
    marginEnd: 5,
    fontWeight: '500',
  },
  listText: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'left',
  },
  link: {
    color: '#1E90FF',
    textDecorationLine: 'underline',
  },
  versionText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginTop: 5,
    alignSelf: 'center',
  },
  copyright: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginTop: 10,
    width: '100%',
    alignSelf: 'center',
  },
});
