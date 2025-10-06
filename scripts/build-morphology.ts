import * as fs from 'fs';
import * as path from 'path';

import type { MorphologyAya } from '../types/morphology-aya';
import type { QuranText } from '../types/quranText';
import { normalizeArabic, removeTashkeel } from '../utils/arabic-utils';

// Full Buckwalter → Arabic map (standard + QAC extensions)
const BUCKWALTER_TO_ARABIC: Record<string, string> = {
  // hamza / alif variants
  "'": 'ء',
  '|': 'آ',
  '>': 'أ',
  O: 'أ', // XML-safe alt
  '<': 'إ',
  I: 'إ', // XML-safe alt
  '&': 'ؤ',
  '}': 'ئ',
  '{': 'ٱ', // alif wasla
  '`': '\u0670', // dagger alif (superscript alef) U+0670

  // consonants
  A: 'ا',
  b: 'ب',
  p: 'ة',
  t: 'ت',
  v: 'ث',
  j: 'ج',
  H: 'ح',
  x: 'خ',
  d: 'د',
  '*': 'ذ',
  r: 'ر',
  z: 'ز',
  s: 'س',
  $: 'ش',
  S: 'ص',
  D: 'ض',
  T: 'ط',
  Z: 'ظ',
  E: 'ع',
  e: 'ع', // some QAC exports use lowercase
  g: 'غ',
  f: 'ف',
  q: 'ق',
  k: 'ك',
  l: 'ل',
  m: 'م',
  n: 'ن',
  h: 'ه',
  w: 'و',
  y: 'ي',
  Y: 'ى',
  _: 'ـ',

  // short vowels & diacritics
  a: 'َ',
  u: 'ُ',
  i: 'ِ',
  o: 'ْ',
  F: 'ً',
  N: 'ٌ',
  K: 'ٍ',
  '~': 'ّ',

  // punctuation / spacing (keep or convert)
  ' ': ' ',
  '-': '-',
  ',': '،',
  '?': '؟',
  ';': '؛',
  '.': '.',
  ':': ':',
};

function buckwalterToArabic(bw: string): string {
  if (!bw) return '';
  // map char-by-char (preserve unknown chars so we can filter later)
  return bw
    .split('')
    .map(
      (ch) =>
        BUCKWALTER_TO_ARABIC[ch] ?? BUCKWALTER_TO_ARABIC[ch as string] ?? ch,
    )
    .join('');
}

function formatRoot(bwRoot: string): string {
  if (!bwRoot) return '';
  const arabic = buckwalterToArabic(bwRoot);
  const noTashkeel = removeTashkeel(arabic);
  const normalized = normalizeArabic(noTashkeel);
  // split letters and join with dash; if single letter or empty return empty
  const letters = normalized
    .split('')
    .filter((c) => /\p{Script=Arabic}/u.test(c));
  return letters.length ? letters.join('-') : '';
}

function cleanLemma(bwLemma: string): string {
  if (!bwLemma) return '';
  const arabic = buckwalterToArabic(bwLemma);
  const withoutTashkeel = removeTashkeel(arabic);
  let normalized = normalizeArabic(withoutTashkeel);

  // final trim and return
  return normalized;
}

// =============== MAIN ===============
function main(): void {
  const assetsDir = path.join(__dirname, '../assets');
  const quranPath = path.join(
    assetsDir,
    'quran-metadata',
    'shared',
    'quran.json',
  );
  const morphTxtPath = path.join(
    __dirname,
    'data',
    'quranic-corpus-morphology-0.4.txt',
  );
  const outputPath = path.join(assetsDir, 'search', 'quran-morphology.json');

  const quranData: QuranText[] = JSON.parse(
    fs.readFileSync(quranPath, 'utf-8'),
  );

  const result: MorphologyAya[] = quranData.map((aya) => ({
    gid: aya.gid,
    lemmas: [],
    roots: [],
  }));

  const ayaKeyToIndex: Record<string, number> = {};
  for (let i = 0; i < quranData.length; i++) {
    const aya = quranData[i];
    ayaKeyToIndex[`${aya.sura_id}:${aya.aya_id}`] = i;
  }

  const lines = fs.readFileSync(morphTxtPath, 'utf-8').split('\n');

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const parts = line.split('\t');
    if (parts.length < 4) continue;

    const posTag = parts[0].replace(/[()]/g, ''); // (1:1:1:1) -> 1:1:1:1
    const morphFeatures = parts[3];
    if (morphFeatures.includes('PREFIX')) continue;

    const [surah, ayah] = posTag.split(':');
    const verseKey = `${surah}:${ayah}`;
    const index = ayaKeyToIndex[verseKey];
    if (index === undefined) continue;

    const features = morphFeatures.split('|');
    let lemmaBw = '';
    let rootBw = '';

    for (const feat of features) {
      if (feat.startsWith('LEM:')) lemmaBw = feat.substring(4);
      else if (feat.startsWith('ROOT:')) rootBw = feat.substring(5);
    }

    if (!lemmaBw) continue;

    const lemmaClean = cleanLemma(lemmaBw);
    const rootClean = formatRoot(rootBw);

    if (lemmaClean) result[index].lemmas.push(lemmaClean);
    if (rootClean) result[index].roots.push(rootClean);
  }

  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf-8');
  console.log(`✅ Generated: ${outputPath}`);
  console.log(`   Verses: ${result.length}`);
}

main();
