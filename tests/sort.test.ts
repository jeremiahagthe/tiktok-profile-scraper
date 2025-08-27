import { describe, it, expect } from 'vitest';
import { sortProfiles } from '../src/sort';

describe('sort', () => {
  it('sorts by followers desc', () => {
    const arr = [
      { username: '@a', profileUrl: '', followerCount: 10, verified: false, posts: [] },
      { username: '@b', profileUrl: '', followerCount: 100, verified: false, posts: [] },
    ] as any;
    const out = sortProfiles(arr, 'followers_desc');
    expect(out[0].username).toBe('@b');
  });
});


