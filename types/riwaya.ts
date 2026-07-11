// Riwaya is the single source of truth — derived from the canonical
// `RIWAYAS` tuple in `@/constants/riwayas`. Adding or removing a riwaya
// is a one-line edit there; this file is a re-export shim so existing
// `import { Riwaya } from '@/types/riwaya'` and `from '@/types'` keep
// working.
export type { Riwaya } from '@/constants/riwayas';
