import { InfluencerProfile } from './types';
import { computeEngagement } from './utils/engagement';
import { filterProfiles } from './filters';
import { sortProfiles } from './sort';
import { ScraperInput } from './schema';
import { dedupeProfilesByUsername } from './utils/dedupe';

export function postProcessProfiles(rawProfiles: InfluencerProfile[], input: ScraperInput): InfluencerProfile[] {
  let profiles = dedupeProfilesByUsername(rawProfiles);
  profiles = profiles.map((p) => ({ ...p, engagement: computeEngagement(p) }));
  profiles = filterProfiles(profiles, input);
  profiles = sortProfiles(profiles, input.sortBy).slice(0, input.maxProfiles);
  return profiles;
}


