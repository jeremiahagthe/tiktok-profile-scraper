# TikTok Influencer Scraper (Apify Actor)

Find TikTok creators by keywords/hashtags, scrape profile stats and recent posts, compute engagement, filter/sort, and output JSON/CSV. Built with Apify Actor + Crawlee Playwright.

## Features
- Keyword/hashtag discovery → collect creator profiles
- Profile fields: username, followers, bio, verified, public email (if present)
- Recent posts per profile (likes/comments/shares/views)
- Engagement metrics: averages + rate; sorting and filtering
- Output to Dataset and Key-Value Store (OUTPUT.json or OUTPUT.csv)
- Rate limiting, retries/backoff, session pool, proxy support
- Optional TikTok cookieString for improved access

## Input (see `INPUT_SCHEMA.json`)
```json
{
  "keywords": ["#makeup", "vegan skincare"],
  "country": "",
  "cookieString": "",
  "minFollowerCount": 1000,
  "maxFollowerCount": 500000,
  "bioContains": ["vegan", "skincare"],
  "emailRequired": false,
  "verifiedOnly": false,
  "maxProfiles": 50,
  "maxPostsPerProfile": 8,
  "engagementRateMin": 0.01,
  "minAverageLikes": 50,
  "minAverageViews": 500,
  "sortBy": "followers_desc",
  "outputFormat": "json"
}
```

Sort options: `followers_desc`, `engagement_desc`, `avg_likes_desc`, `avg_views_desc`.

## Run locally
```bash
npm install
npm run build
node dist/main.js
```

## Deploy on Apify
```bash
npx apify login
npx apify push
```
Trigger via REST:
```bash
curl -X POST "https://api.apify.com/v2/acts/YOUR_ACTOR_ID/runs?token=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d @examples/input.json
```

Fetch results:
- Dataset: follow defaultDatasetId from run response
- KV OUTPUT JSON: GET /v2/key-value-stores/{storeId}/records/OUTPUT
- KV OUTPUT CSV: GET /v2/key-value-stores/{storeId}/records/OUTPUT.csv

## n8n integration
- HTTP Request node: POST to the run endpoint with JSON input
- Poll status (or Wait) → fetch Dataset/KV when finished

## Tips
- Use Apify Proxy (residential/datacenter) for stability; set groups if needed
- Adjust concurrency and MAX_REQUESTS_PER_MINUTE in `src/constants.ts`
- Provide cookieString to improve access when TikTok is aggressive

## Publish to Apify Store
1. Build and push: `npm run build && npx apify push`
2. In Apify Console → Actors → your actor → Publish
3. Fill listing (title, tagline, description, categories), attach README
4. Add example input (`examples/input.json`) and sample output
5. Test a public run from the listing

## Notes
- TikTok DOM may change; selectors include fallbacks in handlers
- Country detection is best-effort (bio/keywords heuristics)
