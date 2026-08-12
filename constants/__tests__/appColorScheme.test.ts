/**
 * Unit tests for appearance-preference resolution.
 * Covers the Settings theme selector: dark, light, and system/automatic.
 */

import { describe, expect, it } from 'vitest';

import {
  colorSchemeFromPreference,
  resolveAppColorScheme,
} from '../appColorScheme';

describe('colorSchemeFromPreference', () => {
  it('returns null for system so the OS appearance is followed', () => {
    expect(colorSchemeFromPreference('system')).toBeNull();
  });

  it('returns dark when the user explicitly chooses dark', () => {
    expect(colorSchemeFromPreference('dark')).toBe('dark');
  });

  it('returns light when the user explicitly chooses light', () => {
    expect(colorSchemeFromPreference('light')).toBe('light');
  });
});

describe('resolveAppColorScheme', () => {
  it('ignores the system scheme when dark is selected', () => {
    expect(resolveAppColorScheme('dark', 'light')).toBe('dark');
    expect(resolveAppColorScheme('dark', 'dark')).toBe('dark');
  });

  it('ignores the system scheme when light is selected', () => {
    expect(resolveAppColorScheme('light', 'dark')).toBe('light');
    expect(resolveAppColorScheme('light', 'light')).toBe('light');
  });

  it('follows the system scheme when automatic is selected', () => {
    expect(resolveAppColorScheme('system', 'dark')).toBe('dark');
    expect(resolveAppColorScheme('system', 'light')).toBe('light');
  });

  it('defaults to light when automatic is selected and the system scheme is unknown', () => {
    expect(resolveAppColorScheme('system', null)).toBe('light');
    expect(resolveAppColorScheme('system', undefined)).toBe('light');
  });
});
