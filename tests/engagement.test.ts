import { describe, it, expect } from 'vitest';
import { aggregateEngagement } from '../src/utils/engagement';

describe('engagement', () => {
  it('computes averages and rate', () => {
    const stats = aggregateEngagement([
      { id: '1', url: 'u', likes: 100, comments: 10, shares: 5, views: 1000 },
      { id: '2', url: 'u', likes: 200, comments: 20, shares: 10, views: 2000 },
    ] as any, 10000);
    expect(Math.round(stats.averageLikes)).toBe(150);
    expect(stats.engagementRate).toBeGreaterThan(0);
  });
});


