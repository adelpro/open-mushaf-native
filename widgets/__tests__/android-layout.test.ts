import { describe, expect, it } from 'vitest';

import {
  buildRingSvg,
  clamp,
  layoutFor,
  surahToIconChar,
  withHexAlpha,
} from '../android-layout';

describe('layoutFor', () => {
  it('returns the normal preset when no size is provided', () => {
    const layout = layoutFor();
    expect(layout.ringSize).toBe(120);
    expect(layout.surahGlyphSize).toBe(60);
    expect(layout.headerFontSize).toBe(22);
    expect(layout.showSurahGlyph).toBe(true);
  });

  it('returns the normal preset for typical 320x120 widget bounds', () => {
    const layout = layoutFor(320, 120);
    expect(layout.ringSize).toBe(120);
    expect(layout.showSurahGlyph).toBe(true);
  });

  it('returns the compact preset when height < 100', () => {
    const layout = layoutFor(320, 90);
    expect(layout.ringSize).toBe(80);
    expect(layout.showSurahGlyph).toBe(false);
  });

  it('returns the wide preset when width >= 400', () => {
    const layout = layoutFor(450, 160);
    expect(layout.ringSize).toBe(140);
    expect(layout.surahGlyphSize).toBe(80);
    expect(layout.headerFontSize).toBe(24);
  });

  it('wide beats compact when both conditions could apply', () => {
    // Compact requires height < 100; wide requires width >= 400.
    // For width=450/height=110, only wide matches → wide layout.
    const layout = layoutFor(450, 110);
    expect(layout.ringSize).toBe(140);
    expect(layout.showSurahGlyph).toBe(true);
  });

  it('compact kicks in only for unusually small heights (< 100dp)', () => {
    // height=90 is below the compact threshold (100), regardless of width.
    const layout = layoutFor(320, 90);
    expect(layout.ringSize).toBe(80);
    expect(layout.showSurahGlyph).toBe(false);
  });
});

describe('surahToIconChar', () => {
  it('maps surah 1 to U+E001', () => {
    expect(surahToIconChar(1).codePointAt(0)).toBe(0xe001);
  });

  it('maps surah 38 to U+E038 (parseInt("38", 16) = 0x38)', () => {
    expect(surahToIconChar(38).codePointAt(0)).toBe(0xe038);
  });

  it('maps surah 114 to U+E114 (parseInt("114", 16) = 0x114 = 276)', () => {
    expect(surahToIconChar(114).codePointAt(0)).toBe(0xe114);
  });
});

describe('clamp', () => {
  it('passes through values inside the range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });
  it('clamps below the min', () => {
    expect(clamp(-3, 0, 10)).toBe(0);
  });
  it('clamps above the max', () => {
    expect(clamp(99, 0, 10)).toBe(10);
  });
  it('passes through min and max edge values', () => {
    expect(clamp(0, 0, 10)).toBe(0);
    expect(clamp(10, 0, 10)).toBe(10);
  });
});

describe('withHexAlpha', () => {
  it('appends an alpha channel to a 6-digit hex', () => {
    expect(withHexAlpha('#1E5243', '33')).toBe('#1E524333');
  });
  it('replaces the alpha channel of a 9-digit hex', () => {
    expect(withHexAlpha('#1E5243AA', '33')).toBe('#1E524333');
  });
  it('trims surrounding whitespace', () => {
    // Cast: `HexColor` template literal requires leading `#`, but the
    // function actually trims any whitespace before validating.
    expect(withHexAlpha('  #1E5243  ' as `#${string}`, '33')).toBe('#1E524333');
  });
});

describe('buildRingSvg', () => {
  it('embeds the label inside the SVG', () => {
    const svg = buildRingSvg({
      radius: 28,
      strokeWidth: 5,
      progress: 50,
      trackColor: '#00000033',
      progressColor: '#1E5243',
      label: '٪50',
      viewBox: 72,
      fontSize: 18,
    });
    expect(svg).toContain('٪50');
  });

  it('scales the ring to the viewBox', () => {
    const svg = buildRingSvg({
      radius: 30,
      strokeWidth: 5,
      progress: 50,
      trackColor: '#00000033',
      progressColor: '#1E5243',
      label: '٪50',
      viewBox: 80,
      fontSize: 14,
    });
    expect(svg).toContain('viewBox="0 0 80 80"');
    expect(svg).toContain('width="80"');
    expect(svg).toContain('height="80"');
  });

  it('renders 0% progress as a fully-open ring (offset = full circumference)', () => {
    const svg = buildRingSvg({
      radius: 28,
      strokeWidth: 5,
      progress: 0,
      trackColor: '#00000033',
      progressColor: '#1E5243',
      label: '٪0',
      viewBox: 72,
      fontSize: 18,
    });
    const circumference = 2 * Math.PI * 28;
    expect(svg).toContain(`stroke-dasharray="${circumference}"`);
    expect(svg).toContain(`stroke-dashoffset="${circumference}"`);
  });

  it('renders 100% progress as a fully-closed ring (offset = 0)', () => {
    const svg = buildRingSvg({
      radius: 28,
      strokeWidth: 5,
      progress: 100,
      trackColor: '#00000033',
      progressColor: '#1E5243',
      label: '٪100',
      viewBox: 72,
      fontSize: 18,
    });
    expect(svg).toContain('stroke-dashoffset="0"');
  });
});
