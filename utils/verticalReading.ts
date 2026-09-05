/**
 * Resolves the primary visible page from a list of viewable items reported
 * by a virtualized list (FlashList/FlatList).
 *
 * The rule is intentionally stable: the primary page is the viewable item
 * with the lowest index (i.e. the topmost item on screen). Indexes are
 * 0-based, so the returned page is `index + 1`.
 *
 * @param viewableItems - Items reported by `onViewableItemsChanged`.
 * @returns The 1-based page number of the primary visible page, or `null`
 * when no viewable item has a valid index.
 */
export function resolvePrimaryVisiblePage(
  viewableItems: readonly { index: number | null | undefined }[],
): number | null {
  let primaryIndex: number | null = null;

  for (const item of viewableItems) {
    if (item.index === null || item.index === undefined) continue;
    if (primaryIndex === null || item.index < primaryIndex) {
      primaryIndex = item.index;
    }
  }

  return primaryIndex === null ? null : primaryIndex + 1;
}
