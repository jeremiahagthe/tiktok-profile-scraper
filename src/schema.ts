import { z } from 'zod';

const SortByEnum = z.enum(['followers_desc', 'engagement_desc', 'avg_likes_desc', 'avg_views_desc']);
const OutputFormatEnum = z.enum(['json', 'csv']);

export const ScraperInputSchema = z
  .object({
    keywords: z.array(z.string().trim()).nonempty(),
    country: z.string().trim().optional().default(''),
    cookieString: z.string().optional().default(''),
    minFollowerCount: z.coerce.number().int().min(0).default(0),
    maxFollowerCount: z.coerce.number().int().min(0).optional(),
    bioContains: z.array(z.string().trim()).optional().default([]),
    emailRequired: z.coerce.boolean().optional().default(false),
    verifiedOnly: z.coerce.boolean().optional().default(false),
    maxProfiles: z.coerce.number().int().min(1).default(100),
    maxPostsPerProfile: z.coerce.number().int().min(0).default(10),
    engagementRateMin: z.coerce.number().min(0).max(1).optional(),
    minAverageLikes: z.coerce.number().min(0).optional(),
    minAverageViews: z.coerce.number().min(0).optional(),
    sortBy: SortByEnum.default('followers_desc'),
    outputFormat: OutputFormatEnum.default('json'),
  })
  .transform((raw) => {
    const uniqueKeywords = Array.from(
      new Set(raw.keywords.map((k) => k.trim()).filter((k) => k.length > 0)),
    );
    const bioContains = Array.from(
      new Set((raw.bioContains ?? []).map((b) => b.trim()).filter((b) => b.length > 0)),
    );
    return { ...raw, keywords: uniqueKeywords, bioContains };
  });

export type ScraperInput = z.infer<typeof ScraperInputSchema>;

export function parseInput(input: unknown): ScraperInput {
  return ScraperInputSchema.parse(input);
}


