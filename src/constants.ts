export const DEFAULT_MAX_CONCURRENCY = 5;
export const DEFAULT_MAX_RETRIES = 3;
export const REQUEST_TIMEOUT_MS = 60_000;
export const RANDOM_DELAY_MS_MIN = 500;
export const RANDOM_DELAY_MS_MAX = 1500;
export const MAX_REQUESTS_PER_MINUTE = 120; // soft throttle target

export const SELECTORS = {
  profile: {
    followerCount: '[data-e2e="followers-count"]',
    followingCount: '[data-e2e="following-count"]',
    bio: '[data-e2e="user-bio"]',
    verifiedBadge: '[data-e2e="verified-badge"], svg[aria-label="Verified account"]',
    postsContainer: '[data-e2e="user-post-item"]',
  },
  search: {
    videoCards: 'a[href*="/video/"]',
    authorLink: 'a[href*="/@"]',
  },
};


