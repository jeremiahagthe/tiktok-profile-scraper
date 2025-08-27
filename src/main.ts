import { Actor, log } from 'apify';
import { createCrawler } from './crawlers/crawlerFactory';
import { parseInput } from './schema';
import { seedSearchRequests, handleSearchPage } from './crawlers/searchHandler';
import { createProfileHandler } from './crawlers/profileHandler';
import { dedupeProfilesByUsername } from './utils/dedupe';
import { computeEngagement } from './utils/engagement';
import { filterProfiles } from './filters';
import { sortProfiles } from './sort';
import { writeOutputs } from './output';
import type { SortBy } from './types';
import { RateLimiter } from './crawlers/throttle';
import { MAX_REQUESTS_PER_MINUTE, RANDOM_DELAY_MS_MAX, RANDOM_DELAY_MS_MIN } from './constants';

Actor.main(async () => {
  const input = parseInput(await Actor.getInput());

  log.info('Starting TikTok Influencer Scraper');
  log.info(`Keywords: ${input.keywords.join(', ')}`);

  const requestQueue = await Actor.openRequestQueue();
  // Seed search requests
  for (const seed of seedSearchRequests(input)) {
    await requestQueue.addRequest({ url: seed.url, label: seed.label });
  }

  const state = { profiles: [] as any[] };

  const limiter = new RateLimiter(MAX_REQUESTS_PER_MINUTE);

  const crawler = createCrawler({
    requestHandler: async (ctx) => {
      const { request } = ctx;
      // Rate limit and jitter before each handler
      await limiter.throttle();
      await new Promise((r) => setTimeout(r, Math.floor(Math.random() * (RANDOM_DELAY_MS_MAX - RANDOM_DELAY_MS_MIN + 1)) + RANDOM_DELAY_MS_MIN));
      if (request.label === 'SEARCH') {
        await handleSearchPage(ctx, input);
      } else if (request.label === 'PROFILE') {
        const handler = createProfileHandler(state as any, input);
        await handler(ctx);
      } else {
        // default: try as search page
        await handleSearchPage(ctx, input);
      }
    },
  });

  // Save cookie string into session userData so preNavigation hook can apply it
  if (input.cookieString) {
    const sessPool = (crawler as any).sessionPool;
    await sessPool?.initialize();
    const sess = await sessPool?.getSession();
    if (sess) {
      sess.userData.cookieString = input.cookieString;
      sess.markGood();
    }
  }

  await crawler.run();

  // Post-process
  let profiles = dedupeProfilesByUsername((state as any).profiles);
  profiles = profiles.map((p) => ({ ...p, engagement: computeEngagement(p) }));
  profiles = filterProfiles(profiles, input);
  profiles = sortProfiles(profiles, input.sortBy as SortBy).slice(0, input.maxProfiles);

  await writeOutputs(profiles, input);

  log.info(`Scraping finished. Output profiles: ${profiles.length}`);
});


