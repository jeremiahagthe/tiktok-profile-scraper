import { PlaywrightCrawler, ProxyConfiguration } from 'crawlee';
import type { PlaywrightCrawlingContext, PlaywrightCrawlerOptions } from 'crawlee';
import { DEFAULT_MAX_CONCURRENCY, RANDOM_DELAY_MS_MAX, RANDOM_DELAY_MS_MIN, REQUEST_TIMEOUT_MS, DEFAULT_MAX_RETRIES } from '../constants';
import { createFailedRequestHandler } from './errorHandling';

function waitMs(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export type RequestHandler = (ctx: PlaywrightCrawlingContext) => Promise<void>;

export interface CrawlerFactoryOptions {
  requestHandler: RequestHandler;
  failedRequestHandler?: PlaywrightCrawlerOptions['failedRequestHandler'];
  maxConcurrency?: number;
}

export function createCrawler(options: CrawlerFactoryOptions): PlaywrightCrawler {
  const proxyConfiguration = new ProxyConfiguration({
    useApifyProxy: true,
  });

  const crawler = new PlaywrightCrawler({
    proxyConfiguration,
    launchContext: {
      launchOptions: {
        headless: true,
      },
    },
    requestHandlerTimeoutSecs: Math.ceil(REQUEST_TIMEOUT_MS / 1000),
    maxRequestRetries: DEFAULT_MAX_RETRIES,
    maxConcurrency: options.maxConcurrency ?? DEFAULT_MAX_CONCURRENCY,
    useSessionPool: true,
    persistCookiesPerSession: true,
    preNavigationHooks: [async ({ page, session }) => {
      await waitMs(randomInt(RANDOM_DELAY_MS_MIN, RANDOM_DELAY_MS_MAX));
      // If cookie string is stored in session userData, apply it
      const cookieString = session?.userData?.cookieString as string | undefined;
      if (cookieString) {
        const cookiePairs = cookieString.split(';').map((c) => c.trim());
        for (const pair of cookiePairs) {
          const [name, ...rest] = pair.split('=');
          const value = rest.join('=');
          if (!name || !value) continue;
          await page.context().addCookies([{ name, value, domain: '.tiktok.com', path: '/' }]).catch(() => undefined);
        }
      }
    }],
    requestHandler: options.requestHandler,
    failedRequestHandler: options.failedRequestHandler ?? createFailedRequestHandler(),
  });

  return crawler;
}


