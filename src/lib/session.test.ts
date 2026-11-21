import { describe, expect, it } from 'vitest';
import { normalizeUsername } from './session';

describe('normalizeUsername', () => {
  it('accepts plain usernames and trims them', () => {
    expect(normalizeUsername('  rj ')).toBe('rj');
    expect(normalizeUsername('@Sam_Pling-2')).toBe('Sam_Pling-2');
  });

  it('pulls the username out of a pasted profile link', () => {
    expect(normalizeUsername('https://www.last.fm/user/SamPling')).toBe('SamPling');
    expect(normalizeUsername('https://www.last.fm/de/user/SamPling/library')).toBe('SamPling');
  });

  it('rejects things that cannot be Last.fm usernames', () => {
    expect(normalizeUsername('')).toBeNull();
    expect(normalizeUsername('a')).toBeNull();
    expect(normalizeUsername('1startsWithDigit')).toBeNull();
    expect(normalizeUsername('has space')).toBeNull();
    expect(normalizeUsername('waytoolongusername')).toBeNull();
    expect(normalizeUsername(42)).toBeNull();
  });
});
