import * as fs from 'fs';
import * as path from 'path';

import type { MorphologyAya } from '../types/morphology-aya';
import type { QuranText } from '../types/quran-text';
import type { WordMap } from '../types/word-map';
import { normalizeArabic } from '../utils/arabic-utils';

// Script to build word-map.json from Quran text + morphology data
// Run via `ts-node scripts/build-word-map.ts`
// Output: assets/search/word-map.json

function main() {
  const assetsDir = path.join(__dirname, '../assets');
  const quranPath = path.join(
    assetsDir,
    'quran-metadata',
    'shared',
    'quran.json',
  );
  const morphPath = path.join(assetsDir, 'search', 'quran-morphology.json');
  const outputPath = path.join(assetsDir, 'search', 'word-map.json');

  // Load data
  const quranData: QuranText[] = JSON.parse(
    fs.readFileSync(quranPath, 'utf-8'),
  );
  const morphologyData: MorphologyAya[] = JSON.parse(
    fs.readFileSync(morphPath, 'utf-8'),
  );

  // Build gid → morphology map
  const morphMap = new Map<number, MorphologyAya>();
  for (const morph of morphologyData) {
    morphMap.set(morph.gid, morph);
  }

  // Build word map: normalized word → { lemma, root? }
  const wordMap: WordMap = {}; // ✅ Correct type: not Record<string, WordMap>

  for (const verse of quranData) {
    const morph = morphMap.get(verse.gid);
    if (!morph || !morph.lemmas?.length) continue;

    // Split verse into words (handle multiple spaces)
    const words = verse.standard_full
      .split(/\s+/)
      .filter((word) => word.trim() !== '');

    for (let i = 0; i < words.length; i++) {
      const normWord = normalizeArabic(words[i]);
      if (!normWord || i >= morph.lemmas.length) continue;

      // Only store first occurrence (all forms → same lemma/root)
      if (!wordMap[normWord]) {
        wordMap[normWord] = {
          lemma: morph.lemmas[i],
          root: morph.roots?.[i], // Optional chaining for safety
        };
      }
    }
  }

  // Save as JSON
  fs.writeFileSync(outputPath, JSON.stringify(wordMap, null, 2), 'utf-8');
  console.log(
    `✅ word-map.json generated (${Object.keys(wordMap).length} entries)`,
  );
}

main();
