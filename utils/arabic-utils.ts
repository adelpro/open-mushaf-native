// =============== ARABIC NORMALIZATION ===============
export const removeTashkeel = (text: string): string => {
  return text
    .replace(/\u0671/g, '\u0627') // Wasl alef → regular alef
    .replace(
      /[\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06FC]/g,
      '',
    );
};

export const normalizeArabic = (text: string): string => {
  if (!text) return '';

  let s = removeTashkeel(text).normalize('NFC');

  // dagger alif + tatweel
  s = s.replace(/[\u0670\u0640]/g, '');

  // alef variants → ا
  s = s.replace(/[إأآٱ]/g, 'ا');

  // hamza variants → ء
  s = s.replace(/[ؤئء]/g, 'ء');

  // alif maqsura → ي
  s = s.replace(/ى/g, 'ي');

  // remove control chars / CRLF / non-Arabic symbols
  s = s.replace(/[\r\n]+/g, ' ');
  s = s.replace(/[^\u0621-\u064A\s-]+/g, '');
  s = s.replace(/\s{2,}/g, ' ');

  return s.trim();
};
