/**
 * StyleSheet for the Mushaf TopMenu overlay and its action buttons.
 *
 * Used by `components/TopMenu/index.tsx` and `components/TopMenu/ActionButton.tsx`.
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
  surahSection: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    minWidth: 96,
    paddingHorizontal: 4,
  },
  surahName: {
    fontFamily: 'Tajawal_700Bold',
    fontSize: 15,
    lineHeight: 20,
    width: '100%',
    textAlign: 'center',
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
  ornamentDivider: {
    width: 10,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    paddingVertical: 4,
  },
  dividerLine: {
    width: StyleSheet.hairlineWidth,
    flex: 1,
    opacity: 0.7,
  },
  dividerDiamond: {
    width: 7,
    height: 7,
    marginVertical: 3,
    transform: [{ rotate: '45deg' }],
    opacity: 0.9,
  },
  juzSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    minWidth: 52,
    flexShrink: 1,
  },
  juzLabel: {
    fontFamily: 'Tajawal_500Medium',
    fontSize: 11,
    lineHeight: 14,
  },
  juzNumber: {
    fontFamily: 'Tajawal_700Bold',
    fontSize: 22,
    lineHeight: 28,
  },
  juzNumberCompact: {
    fontSize: 18,
    lineHeight: 22,
  },
  juzName: {
    fontFamily: 'Tajawal_500Medium',
    fontSize: 10,
    lineHeight: 14,
    textAlign: 'center',
  },
  juzNameCompact: {
    fontSize: 9,
    lineHeight: 12,
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
    justifyContent: 'flex-end',
    gap: 2,
    flexShrink: 1,
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
