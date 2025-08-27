import type { PlaywrightCrawlerOptions } from 'crawlee';
import { Actor } from 'apify';

export function createFailedRequestHandler(): PlaywrightCrawlerOptions['failedRequestHandler'] {
  return async ({ request, error, log }) => {
    log.warning(`Request failed after retries: ${request.url}. Error: ${(error as Error)?.message}`);
    const dataset = await Actor.openDataset('failures');
    await dataset.pushData({
      url: request.url,
      label: request.label,
      error: (error as Error)?.message ?? String(error),
      retries: request.retryCount,
      time: new Date().toISOString(),
    });
  };
}


