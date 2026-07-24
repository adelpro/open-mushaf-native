/**
 * Phase 5: search is online-only via qurani.ai, so the local
 * search-engine types are gone. The placeholder type lives here
 * so existing imports compile; downstream code (the search
 * screen, useQuranSearch) defines its own typed shape now.
 */

export type SearchOptions = Record<string, never>;
export type AdvancedSearchOptions = Record<string, never>;
