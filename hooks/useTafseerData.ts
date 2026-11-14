import { useEffect, useRef, useState } from 'react';

import { quranTafseerUrl, TafseerKey } from '@/constants/TafseerCdn';
import { TafseerAya } from '@/types';
import { persistTafseer, readTafseerFromDisk } from '@/utils/downloads';
import { throwIfAborted } from '@/utils/downloads/coordinator';
import { parseTafseer } from '@/utils/downloads/validation';

async function loadTafseerData(
  key: TafseerKey,
  cache: Map<TafseerKey, TafseerAya[]>,
  signal: AbortSignal,
): Promise<TafseerAya[]> {
  const cached = cache.get(key);
  if (cached) return cached;
  const disk = await readTafseerFromDisk(key);
  throwIfAborted(signal);
  let data: TafseerAya[];
  if (disk !== null) data = parseTafseer(disk, key);
  else {
    const response = await fetch(quranTafseerUrl(key), { signal });
    if (!response.ok) throw new Error('HTTP ' + response.status);
    const raw = await response.text();
    throwIfAborted(signal);
    data = parseTafseer(raw, key);
    // Cache writes are optional for online reading; failures are handled here.
    void persistTafseer(key, raw, signal).catch(() => {});
  }
  cache.set(key, data);
  return data;
}

export function useTafseerData(selectedTab: TafseerKey) {
  const cacheRef = useRef(new Map<TafseerKey, TafseerAya[]>());
  const [cache, setCache] = useState(new Map<TafseerKey, TafseerAya[]>());
  const [tafseerData, setTafseerData] = useState<TafseerAya[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    setTafseerData(null);
    setError(null);
    setLoading(true);
    const load = async () => {
      try {
        const data = await loadTafseerData(
          selectedTab,
          cacheRef.current,
          controller.signal,
        );
        if (!active) return;
        setCache(new Map(cacheRef.current));
        setTafseerData(data);
      } catch (err) {
        if (active)
          setError(err instanceof Error ? err.message : 'فشل تحميل التفسير');
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
      controller.abort();
    };
  }, [selectedTab]);
  return { cache, tafseerData, loading, error };
}
