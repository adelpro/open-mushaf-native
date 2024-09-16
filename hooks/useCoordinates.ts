import { useEffect, useState } from 'react';

import { Aya, Page } from '@/types';

export function useCoordinates(index: number) {
  const [coordinates, setCoordinates] = useState<Page[]>([]);
  const [page, setPage] = useState<Aya[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCoordinates = async () => {
      try {
        const url = `${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/quran-metadata/mushaf-elmadina-warsh-azrak/aya.json`;
        const data = (await fetch(url, {
          cache: 'force-cache',
        }).then((response) => response.json())) as {
          coordinates: Page[];
        };
        setCoordinates(data?.coordinates || []);

        setPage(data.coordinates[index] || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    loadCoordinates();
  }, [index]);

  return { coordinates, page, loading, error };
}
