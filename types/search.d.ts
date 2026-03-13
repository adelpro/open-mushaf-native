/**
 * Search options representing active toggle states for advanced linguistic parsing.
 */
export interface AdvancedOptions {
  /** If true, expands search scope matching lemma forms. */
  lemma: boolean;
  /** If true, expands search scope matching root structures. */
  root: boolean;
  /** If true, permits typographical fuzzy matching. */
  fuzzy: boolean;
}
