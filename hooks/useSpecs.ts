import { useEffect, useState } from 'react';

import { Specs } from '@/types';

export function useSpecs() {
  const defaultSpecs: Specs = {
    defaultPageHeight: 616,
    defaultMarginX: 20,
    defaultPageWidth: 430,
    defaultMarginY: 20,
    defaultLineHeight: 40,
    defaultNumberOfPages: 604,
    defaultFirstPagesWidth: 320,
    defaultFirstPAgesMarginX: 120,
    defaultFirstPagesMarginY: 20,
  };

  const [specs, setSpecs] = useState<Specs>(defaultSpecs);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSpecs = async () => {
      try {
        const url = `${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/quran-metadata/mushaf-elmadina-warsh-azrak/specs.json`;
        const response = await fetch(url, {
          cache: 'force-cache',
        });
        if (!response.ok) {
          throw new Error('Failed to load specs');
        }
        const data: Specs = await response.json();
        setSpecs(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
      }
    };

    loadSpecs();
  }, []);

  return { specs, loading, error };
}
