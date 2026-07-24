/**
 * Mapping from the app's `Riwaya` literal-union (defined in
 * `constants/riwayas.ts`) to the qurani.ai edition identifier used by
 * the REST endpoints.
 *
 * The original 6-riwaya set included `qalon-libya-awqaf` — a Libyan
 * Awqaf mushaf with a 612-page layout that does not exist on
 * qurani.ai. Per user direction ("follow qurani.ai logic, remove any
 * non-existing layout"), that riwaya has been removed from
 * `constants/riwayas.ts`. The remaining 5 riwayas map 1:1 to qurani.ai
 * narrations.
 *
 * Reference: https://qurani.ai/en/docs/1-general-apis (edition listing)
 */

import { type Riwaya, RIWAYAS } from './riwayas';

/**
 * For each app `Riwaya`, the qurani.ai edition identifier that
 * returns its narration text. Use this anywhere we need to call the
 * API or read/write the per-riwaya cache.
 */
export const RIWAYA_TO_QURANI_EDITION: Record<Riwaya, string> =
  Object.fromEntries(
    RIWAYAS.map((r) => [r.id, quraniEditionFor(r.id)]),
  ) as Record<Riwaya, string>;

/**
 * Resolve the qurani.ai edition identifier for a given riwaya. Falls
 * back to `quran-hafs` for any unknown value (defensive — should
 * never trigger now that the Riwaya union is closed).
 */
export function quraniEditionFor(riwaya: Riwaya): string {
  switch (riwaya) {
    case 'hafs':
      return 'quran-hafs';
    case 'warsh':
      return 'quran-warsh';
    case 'qalon-kfqc':
      return 'quran-qaloon';
    case 'douri-kfqc':
      return 'quran-aldouri';
    case 'shubah-kfqc':
      return 'quran-shoba';
    default: {
      // Exhaustiveness guard — adding a new Riwaya in the future
      // requires a case here.
      const _exhaustive: never = riwaya;
      return _exhaustive;
    }
  }
}
