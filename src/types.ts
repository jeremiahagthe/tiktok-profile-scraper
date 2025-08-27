export type SortBy = 'followers_desc' | 'engagement_desc' | 'avg_likes_desc' | 'avg_views_desc';
export type OutputFormat = 'json' | 'csv';

export interface EngagementStats {
  averageLikes: number;
  averageComments: number;
  averageShares: number;
  averageViews: number;
  engagementRate: number; // ratio 0..1
}

export interface InfluencerPost {
  id: string;
  url: string;
  caption?: string;
  likes?: number;
  comments?: number;
  shares?: number;
  views?: number;
  timestampIso?: string; // ISO string when available
}

export interface InfluencerProfile {
  username: string;
  fullName?: string;
  userId?: string;
  profileUrl: string;
  followerCount: number;
  followingCount?: number;
  bio?: string;
  verified: boolean;
  email?: string;
  country?: string;
  posts: InfluencerPost[];
  engagement?: EngagementStats;
}


