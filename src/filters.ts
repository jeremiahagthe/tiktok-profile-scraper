import { InfluencerProfile } from './types';
import { ScraperInput } from './schema';
import { detectCountryFromText } from './utils/location';

function bioContainsAll(bio: string | undefined, needles: string[]): boolean {
  if (!needles || needles.length === 0) return true;
  const hay = (bio || '').toLowerCase();
  return needles.every((n) => hay.includes(n.toLowerCase()))
}

export function filterProfiles(profiles: InfluencerProfile[], input: ScraperInput): InfluencerProfile[] {
  const maxFollowers = input.maxFollowerCount ?? Number.POSITIVE_INFINITY;
  const minFollowers = input.minFollowerCount ?? 0;
  const minEngagement = input.engagementRateMin ?? 0;
  const minAvgLikes = input.minAverageLikes ?? 0;
  const minAvgViews = input.minAverageViews ?? 0;
  const requireEmail = input.emailRequired ?? false;
  const verifiedOnly = input.verifiedOnly ?? false;
  const needles = input.bioContains ?? [];
  const country = (input.country || '').trim().toLowerCase();

  return profiles.filter((p) => {
    if (p.followerCount < minFollowers) return false;
    if (p.followerCount > maxFollowers) return false;
    if (verifiedOnly && !p.verified) return false;
    if (requireEmail && !p.email) return false;
    if (!bioContainsAll(p.bio, needles)) return false;
    if (p.engagement && p.engagement.engagementRate < minEngagement) return false;
    if (p.engagement && p.engagement.averageLikes < minAvgLikes) return false;
    if (p.engagement && p.engagement.averageViews < minAvgViews) return false;
    if (country) {
      const inferred = (p.country || detectCountryFromText(p.bio || ''))?.toLowerCase();
      if (!inferred || inferred !== country) return false;
    }
    return true;
  });
}


