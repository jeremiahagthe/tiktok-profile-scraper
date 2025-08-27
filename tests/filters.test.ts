import { describe, it, expect } from 'vitest';
import { filterProfiles } from '../src/filters';

describe('filters', () => {
  it('filters by followers and verification', () => {
    const profiles = [
      { username: '@a', profileUrl: '', followerCount: 1000, verified: true, posts: [] },
      { username: '@b', profileUrl: '', followerCount: 100, verified: false, posts: [] },
    ] as any;
    const input: any = { minFollowerCount: 500, verifiedOnly: true };
    const out = filterProfiles(profiles, input);
    expect(out.length).toBe(1);
    expect(out[0].username).toBe('@a');
  });
});


