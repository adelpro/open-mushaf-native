/**
 * StyleSheet for the Mushaf TopMenu overlay and its action buttons.
 *
 * Used by TopMenu overlay pieces (`index`, `TopMenuBar`, sections, `ActionButton`).
 */
import { Platform, StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    zIndex: 2,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: '100%',
    backgroundColor: 'transparent',
  },
  topMenu: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    // Pointy top corners; soft bottom edge.
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderTopWidth: 0,
    paddingBottom: 8,
    gap: 6,
  },
  menuShadow: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
      },
      android: {
        elevation: 3,
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
      },
    }),
  },
  contextSection: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    minWidth: 0,
    // RTL: flex-start = next to the page badge (physical right).
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  contextCluster: {
    maxWidth: '100%',
    flexShrink: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 2,
  },
  surahRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 6,
    maxWidth: '100%',
    flexShrink: 1,
  },
  surahName: {
    fontFamily: 'Tajawal_700Bold',
    fontSize: 15,
    lineHeight: 20,
    flexShrink: 1,
    minWidth: 0,
    textAlign: 'right',
  },
  surahNameCompact: {
    fontSize: 13,
    lineHeight: 17,
  },
  surahBadge: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  surahBadgeMark: {
    position: 'absolute',
  },
  surahNumber: {
    fontFamily: 'Tajawal_700Bold',
    fontSize: 12,
    lineHeight: 15,
    zIndex: 1,
  },
  surahNumberCompact: {
    fontSize: 10,
  },
  juzCaption: {
    fontFamily: 'Tajawal_500Medium',
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'right',
    alignSelf: 'flex-start',
  },
  juzCaptionCompact: {
    fontSize: 10,
    lineHeight: 14,
  },
  pageSection: {
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    paddingHorizontal: 4,
  },
  pageBadge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageBadgeMark: {
    position: 'absolute',
  },
  pageBadgeContent: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    gap: 1,
  },
  pageLabel: {
    fontFamily: 'Tajawal_500Medium',
    fontSize: 8,
    lineHeight: 10,
    textAlign: 'center',
  },
  pageLabelCompact: {
    fontSize: 7,
    lineHeight: 9,
  },
  pageNumber: {
    fontFamily: 'Tajawal_700Bold',
    fontSize: 15,
    lineHeight: 17,
    textAlign: 'center',
  },
  pageNumberCompact: {
    fontSize: 13,
    lineHeight: 15,
  },
  plainDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    marginVertical: 6,
    opacity: 0.55,
  },
  actionsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 2,
    flexShrink: 0,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 40,
    paddingHorizontal: 1,
  },
  actionIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontFamily: 'Tajawal_500Medium',
    fontSize: 10,
    lineHeight: 14,
    marginTop: 2,
  },
  progressContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
