import { describe, it, expect } from 'vitest';
import { parseTikTokNumber, extractEmail, parseDateSafe } from '../src/utils/parsing';

describe('parsing utils', () => {
  it('parses K/M/B suffixed numbers', () => {
    expect(parseTikTokNumber('1.2K')).toBe(1200);
    expect(parseTikTokNumber('3M')).toBe(3000000);
    expect(parseTikTokNumber('4b')).toBe(4000000000);
  });
  it('parses plain digits', () => {
    expect(parseTikTokNumber('12,345')).toBe(12345);
  });
  it('extracts email', () => {
    expect(extractEmail('contact me: user@example.com')).toBe('user@example.com');
    expect(extractEmail('no mail')).toBeUndefined();
  });
  it('parses dates safely', () => {
    const iso = parseDateSafe('2024-01-01');
    expect(iso?.startsWith('2024-01-01')).toBe(true);
    expect(parseDateSafe('invalid')).toBeUndefined();
  });
});


