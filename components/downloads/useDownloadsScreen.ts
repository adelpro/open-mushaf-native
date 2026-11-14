import { useState } from 'react';

import { useColors } from '@/hooks';

import { useDownloadActions } from './useDownloadActions';
import { useDownloadStorage } from './useDownloadStorage';
export function useDownloadsScreen() {
  const colors = useColors();
  const storage = useDownloadStorage();
  const actions = useDownloadActions(storage.refreshSizes);
  // Per-section collapse state. Defaults to expanded so users see
  // everything on first visit. Local state only — collapse preference
  // is ephemeral (not persisted to MMKV).
  const [riwayaSectionExpanded, setRiwayaSectionExpanded] = useState(true);
  const [tafseerSectionExpanded, setTafseerSectionExpanded] = useState(true);

  return {
    ...colors,
    ...storage,
    ...actions,
    riwayaSectionExpanded,
    setRiwayaSectionExpanded,
    tafseerSectionExpanded,
    setTafseerSectionExpanded,
  };
}
