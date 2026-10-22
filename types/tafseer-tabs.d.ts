// Canonical TafseerTabs — kept as a *re-export* of the authoritative
// `TafseerKey` from `@/constants/TafseerCdn`. This file used to
// declare its own union that drifted from `TafseerKey`
// (`'waseet'` vs `'nozool-wahidy'`); the persisted `tafseerTab`
// atom expects this legacy name so callers use it as the
// source-of-truth alias.

export type { TafseerKey as TafseerTabs } from '@/constants/TafseerCdn';
