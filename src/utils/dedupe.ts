import { InfluencerProfile } from '../types';

export function dedupeProfilesByUsername(profiles: InfluencerProfile[]): InfluencerProfile[] {
  const seen = new Set<string>();
  const result: InfluencerProfile[] = [];
  for (const p of profiles) {
    const key = p.username.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(p);
  }
  return result;
}


