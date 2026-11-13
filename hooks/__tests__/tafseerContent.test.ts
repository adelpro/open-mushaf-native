import { describe, expect, it } from 'vitest';

import { sanitizeTafseerHtml, useTafseerContent } from '../useTafseerContent';
describe('tafseer HTML boundary', () => {
  it('preserves basic text formatting', () => {
    expect(
      sanitizeTafseerHtml('<p>تفسير <strong>الآية</strong><br/></p>'),
    ).toBe('<p>تفسير <strong>الآية</strong><br></p>');
  });
  it('removes links, embedded content, and event attributes', () => {
    const html = sanitizeTafseerHtml(
      '<p onclick="alert(1)">text</p><img src=x onerror=alert(1)><a href="javascript:alert(1)">link</a><script>alert(1)</script>',
    );
    expect(html).not.toMatch(/<(?:script|img|a)\b|onclick|onerror|javascript:/);
  });
  it.each([
    ['<<img src=x onerror=alert(1)>', ''],
    ['text<script', 'text&lt;script'],
    [
      '<svg><foreignObject><p onload=x>text</p></foreignObject></svg>',
      'text</p>',
    ],
    ['<IMG SRC="javascript:alert(1)">', ''],
  ])(
    'encodes malformed tags and rejects active markup: %s',
    (input, expected) => {
      expect(sanitizeTafseerHtml(input)).toBe(expected);
    },
  );
  it('keeps Arabic text, entities and line breaks readable', () => {
    expect(sanitizeTafseerHtml('تفسير &amp; معنى<br />سطر')).toBe(
      'تفسير &amp; معنى<br>سطر',
    );
  });
  it('sanitizes the content returned to the renderer', () => {
    const html = useTafseerContent({
      tafseerData: [
        { id: 1, sura: 1, aya: 1, text: '<iframe src=x></iframe><p>تفسير</p>' },
      ],
      surah: 1,
      aya: 1,
    });
    expect(html).toBe('<div><p>تفسير</p></div>');
  });
});
