/**
 * Tafseer lookup helpers.
 *
 * Phase 3 introduces gid-first lookup: callers pass the qurani.ai gid
 * (canonical internal id) plus the narration cache's `gidByLayoutKey`
 * index, and the helper resolves gid → (sura, nIS) before hitting
 * the data. This decouples the lookup from the component tree —
 * `Tafseer.tsx` doesn't need to thread (sura, aya) through props.
 *
 * The static-CDN tafseer JSONs (from `cdn.jsdelivr.net/.../assets/
 * tafaseer/<key>.json`) are keyed by `{id, sura, aya, text}` where
 * `id` is a per-tafseer numeric key (NOT the qurani.ai gid). So the
 * data lookup uses (sura, aya). Phase 4 swaps the CDN for
 * gid-keyed JSONs from qurani.ai and the lookup becomes a direct
 * `t.id === gid` — the function signature stays the same.
 */

import { TafseerAya } from '@/types';

type UseFormattedTafseerParams = {
  tafseerData: TafseerAya[] | null;
  surah: number;
  aya: number;
};

/**
 * Locate the tafseer row for a given gid.
 *
 * `gidByLayoutKey` maps `${surah}:${numberInSurah}` → gid and the
 * reverse direction; we build the forward lookup at call sites
 * (see `useTafseerCache.ts`). For Phase 3 we walk the per-narration
 * map to find the (sura, nIS) that maps back to the gid.
 */
export function findTafseerByGid(
  tafseerData: TafseerAya[] | null,
  gid: number,
  surah: number,
  layoutNumberByGid: Map<number, number>,
): TafseerAya | undefined {
  if (!tafseerData) return undefined;
  const nIS = layoutNumberByGid.get(gid);
  if (nIS === undefined) return undefined;
  return tafseerData.find((t) => t.sura === surah && t.aya === nIS);
}

/**
 * Custom hook to find and format Tafseer text for a specific aya and surah.
 *
 * @deprecated Prefer `findTafseerByGid` with the narration cache's
 * `layoutNumberByGid` index — this helper still works for the
 * static-CDN JSONs that don't carry gid, but Phase 4 will remove it.
 */
export function useTafseerContent({
  tafseerData,
  surah,
  aya,
}: UseFormattedTafseerParams): string {
  const ayaTafseer = tafseerData?.find(
    (t) => t.sura === surah && t.aya === aya,
  );

  let tafseerText = '';
  if (!ayaTafseer?.text || ayaTafseer?.text === '<p></p>') {
    tafseerText = '<p>لا يوجد تفسير.</p>';
  } else {
    // If !ayaTafseer?.text is false, ayaTafseer and ayaTafseer.text are guaranteed to be defined.
    tafseerText = `<div>${ayaTafseer.text}</div>`;
  }
  return tafseerText;
}

/**
 * Custom hook to check if Tafseer text is available for a specific aya and surah.
 *
 * @deprecated Prefer `findTafseerByGid` — same caveat as above.
 */
export function hasNoTafseerContent({
  tafseerData,
  surah,
  aya,
}: UseFormattedTafseerParams): boolean {
  const ayaTafseer = tafseerData?.find(
    (t) => t.sura === surah && t.aya === aya,
  );

  if (
    !ayaTafseer?.text ||
    ayaTafseer.text.trim() === '' ||
    ayaTafseer.text === '<p></p>'
  ) {
    return true; // No tafseer content
  }
  return false; // Tafseer content exists
}
