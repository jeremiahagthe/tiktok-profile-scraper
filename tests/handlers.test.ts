import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import { SELECTORS } from '../src/constants';
import { parseTikTokNumber } from '../src/utils/parsing';

describe('handlers (mocked DOM)', () => {
  it('search handler selectors find authors', async () => {
    const html = await (await import('fs/promises')).readFile('tests/fixtures/search.html', 'utf8');
    const dom = new JSDOM(html);
    const doc = dom.window.document;
    const links = Array.from(doc.querySelectorAll(SELECTORS.search.authorLink));
    expect(links.length).toBeGreaterThan(0);
  });

  it('profile selectors parse counts', async () => {
    const html = await (await import('fs/promises')).readFile('tests/fixtures/profile.html', 'utf8');
    const dom = new JSDOM(html);
    const doc = dom.window.document;
    const followers = doc.querySelector('[data-e2e="followers-count"]')?.textContent || '';
    expect(parseTikTokNumber(followers)).toBe(1200);
  });
});


