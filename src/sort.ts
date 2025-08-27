import { InfluencerProfile, SortBy } from './types';

export function sortProfiles(profiles: InfluencerProfile[], sortBy: SortBy = 'followers_desc'): InfluencerProfile[] {
  const copy = [...profiles];
  switch (sortBy) {
    case 'engagement_desc':
      copy.sort((a, b) => (b.engagement?.engagementRate ?? 0) - (a.engagement?.engagementRate ?? 0));
      break;
    case 'avg_likes_desc':
      copy.sort((a, b) => (b.engagement?.averageLikes ?? 0) - (a.engagement?.averageLikes ?? 0));
      break;
    case 'avg_views_desc':
      copy.sort((a, b) => (b.engagement?.averageViews ?? 0) - (a.engagement?.averageViews ?? 0));
      break;
    case 'followers_desc':
    default:
      copy.sort((a, b) => (b.followerCount ?? 0) - (a.followerCount ?? 0));
      break;
  }
  return copy;
}


