import type { PlaywrightCrawlingContext } from 'crawlee';
import { SELECTORS } from '../constants';
import { parseTikTokNumber, extractEmail } from '../utils/parsing';
import { InfluencerPost, InfluencerProfile } from '../types';
import { ScraperInput } from '../schema';

export interface ProfileHandlerState {
  profiles: InfluencerProfile[];
}

function usernameFromUrl(url: string): string {
  const m = url.match(/\/(@[^/?#]+)/);
  return m ? m[1] : url;
}

async function extractPosts(ctx: PlaywrightCrawlingContext, maxPosts: number): Promise<InfluencerPost[]> {
  const { page } = ctx;
  const nodes = await page.$$(SELECTORS.profile.postsContainer);
  const items: InfluencerPost[] = [];
  for (let i = 0; i < Math.min(nodes.length, maxPosts); i++) {
    const el = nodes[i];
    const url = (await el.$eval('a', (a) => (a as any).href).catch(() => undefined)) || '';
    const caption = await el.$eval('[data-e2e="user-post-item-desc"], figcaption, [aria-label]', (n) => n.textContent || '').catch(() => undefined);
    const likesText = await el.$eval('[data-e2e="like-count"], [aria-label*="like" i]', (n) => n.textContent || '').catch(() => undefined);
    const commentsText = await el.$eval('[data-e2e="comment-count"], [aria-label*="comment" i]', (n) => n.textContent || '').catch(() => undefined);
    const sharesText = await el.$eval('[data-e2e="share-count"], [aria-label*="share" i]', (n) => n.textContent || '').catch(() => undefined);
    const viewsText = await el.$eval('[data-e2e*="play-count"], [aria-label*="view" i]', (n) => n.textContent || '').catch(() => undefined);

    items.push({
      id: url.split('/').pop() || url,
      url,
      caption: caption?.trim() || undefined,
      likes: parseTikTokNumber(likesText || undefined),
      comments: parseTikTokNumber(commentsText || undefined),
      shares: parseTikTokNumber(sharesText || undefined),
      views: parseTikTokNumber(viewsText || undefined),
    });
  }
  return items;
}

export function createProfileHandler(state: ProfileHandlerState, input: ScraperInput) {
  return async function handleProfilePage(ctx: PlaywrightCrawlingContext): Promise<void> {
    const { page, request, log } = ctx;
    const url = request.loadedUrl || request.url;
    const username = usernameFromUrl(url);

    try {
      // Wait best-effort for profile header
      await page.waitForSelector(SELECTORS.profile.followerCount, { timeout: 10000 }).catch(() => undefined);

      const followerText = await page.$eval(SELECTORS.profile.followerCount, (n) => n.textContent || '').catch(async () => {
        const alt = await page.$eval('[data-e2e*="fans" i], [aria-label*="followers" i]', (n) => n.textContent || '').catch(() => '');
        return alt;
      });
      const followingText = await page.$eval(SELECTORS.profile.followingCount, (n) => n.textContent || '').catch(async () => {
        const alt = await page.$eval('[data-e2e*="following" i], [aria-label*="following" i]', (n) => n.textContent || '').catch(() => '');
        return alt;
      });
      const bioText = await page.$eval(SELECTORS.profile.bio, (n) => n.textContent || '').catch(async () => {
        const alt = await page.$eval('[data-e2e*="bio" i], [data-e2e*="desc" i]', (n) => n.textContent || '').catch(() => '');
        return alt;
      });
      const verified = !!(await page.$(SELECTORS.profile.verifiedBadge));

      const followerCount = parseTikTokNumber(followerText);
      const followingCount = parseTikTokNumber(followingText);
      const email = extractEmail(bioText || undefined);

      const posts = await extractPosts(ctx, input.maxPostsPerProfile);

      const profile: InfluencerProfile = {
        username,
        profileUrl: url,
        followerCount,
        followingCount,
        bio: bioText?.trim() || undefined,
        verified,
        email,
        posts,
      };

      state.profiles.push(profile);
      log.debug(`Collected profile ${username} with ${posts.length} posts`);
    } catch (err) {
      log.warning(`Failed to extract profile for ${username}: ${(err as Error).message}`);
    }
  };
}


