import { InfluencerPost, EngagementStats, InfluencerProfile } from '../types';

function average(values: Array<number | undefined>): number {
  const nums = values.map((v) => (typeof v === 'number' && isFinite(v) ? v : 0));
  if (nums.length === 0) return 0;
  const sum = nums.reduce((a, b) => a + b, 0);
  return nums.length ? sum / nums.length : 0;
}

export function aggregateEngagement(posts: InfluencerPost[], followerCount: number): EngagementStats {
  const averageLikes = average(posts.map((p) => p.likes));
  const averageComments = average(posts.map((p) => p.comments));
  const averageShares = average(posts.map((p) => p.shares));
  const averageViews = average(posts.map((p) => p.views));

  let engagementRate = 0;
  const numerator = averageLikes + averageComments + averageShares;
  if (averageViews > 0) {
    engagementRate = numerator / averageViews;
  } else if (followerCount > 0) {
    engagementRate = numerator / followerCount;
  }
  if (!isFinite(engagementRate) || engagementRate < 0) engagementRate = 0;

  return {
    averageLikes,
    averageComments,
    averageShares,
    averageViews,
    engagementRate,
  };
}

export function computeEngagement(profile: InfluencerProfile): EngagementStats {
  return aggregateEngagement(profile.posts ?? [], profile.followerCount ?? 0);
}


