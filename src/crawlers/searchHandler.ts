import type { PlaywrightCrawlingContext } from 'crawlee';
import { SELECTORS } from '../constants';
import { buildProfileUrl, isHashtag, buildHashtagUrl, buildSearchUrlForKeyword } from '../utils/url';
import type { ScraperInput } from '../schema';

export async function handleSearchPage(ctx: PlaywrightCrawlingContext, _input: ScraperInput): Promise<void> {
  const { page, log } = ctx;

  // Ensure content is loaded (best-effort)
  try {
    await page.waitForSelector(SELECTORS.search.videoCards, { timeout: 10000 });
  } catch {
    await page.waitForSelector('a[href*="/@"]', { timeout: 5000 }).catch(() => undefined);
  }

  const authorHrefs: string[] = await page.$$eval(SELECTORS.search.authorLink, (as) =>
    Array.from(new Set(as.map((a) => (a as any).getAttribute('href') || '').filter(Boolean))),
  );

  const usernames = Array.from(
    new Set(
      authorHrefs
        .map((href) => {
          try {
            const m = href.match(/\/(@[^/?#]+)/);
            return m ? m[1] : undefined;
          } catch {
            return undefined;
          }
        })
        .filter((u): u is string => !!u),
    ),
  );

  const profileUrls = usernames.map((u) => buildProfileUrl(u));
  if (profileUrls.length > 0) {
    log.info(`Enqueuing ${profileUrls.length} profile URLs from search page`);
    await ctx.enqueueLinks({
      urls: profileUrls,
      label: 'PROFILE',
    });
  }
}

export function seedSearchRequests(input: ScraperInput): { url: string; label: string }[] {
  const seeds: { url: string; label: string }[] = [];
  for (const term of input.keywords) {
    if (isHashtag(term)) {
      seeds.push({ url: buildHashtagUrl(term), label: 'SEARCH' });
    } else {
      seeds.push({ url: buildSearchUrlForKeyword(term), label: 'SEARCH' });
    }
  }
  return seeds;
}


