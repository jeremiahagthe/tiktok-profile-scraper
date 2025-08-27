import { Actor } from 'apify';
import Papa from 'papaparse';
import { InfluencerProfile } from './types';
import { ScraperInput } from './schema';

function toCsvRows(profiles: InfluencerProfile[]) {
  return profiles.map((p) => ({
    username: p.username,
    profileUrl: p.profileUrl,
    followerCount: p.followerCount,
    verified: p.verified,
    email: p.email || '',
    country: p.country || '',
    postsCount: p.posts?.length ?? 0,
    avgLikes: p.engagement?.averageLikes ?? 0,
    avgComments: p.engagement?.averageComments ?? 0,
    avgShares: p.engagement?.averageShares ?? 0,
    avgViews: p.engagement?.averageViews ?? 0,
    engagementRate: p.engagement?.engagementRate ?? 0,
  }));
}

export async function writeOutputs(profiles: InfluencerProfile[], input: ScraperInput) {
  const dataset = await Actor.openDataset();
  await dataset.pushData(profiles);

  const kv = await Actor.openKeyValueStore();
  const metadata = {
    generatedAt: new Date().toISOString(),
    count: profiles.length,
    format: input.outputFormat,
    version: '0.0.1',
  };

  if (input.outputFormat === 'csv') {
    const csv = Papa.unparse(toCsvRows(profiles));
    await kv.setValue('OUTPUT.csv', csv, { contentType: 'text/csv; charset=utf-8' });
    await kv.setValue('OUTPUT', { metadata, csvKey: 'OUTPUT.csv' });
  } else {
    await kv.setValue('OUTPUT', { metadata, profiles });
  }
}


