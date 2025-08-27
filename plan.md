# Implementation Plan

## Project Scaffolding and Configuration
- [x] Step 1: Initialize Apify actor project structure
  - **Task**: Create TypeScript-based Apify actor with project metadata and build scripts.
  - **Files**:
    - `package.json`: Scripts (`build`, `start`, `push`, `test`), deps (`apify`, `crawlee`, `playwright`, `zod`, `papaparse` or `fast-csv`, `pino`, `@apify/tsconfig`), devDeps (`typescript`, `ts-node`, `tsup` or `esbuild`, `vitest`, `@types/node`).
    - `tsconfig.json`: TS configuration targeting Node 18+.
    - `apify.json`: Actor definition (`name`, `version`, `buildTag`, `env`, `main`).
    - `.gitignore`: Ignore `dist`, `node_modules`, `.apify`, etc.
  - **Step Dependencies**: None
  - **User Instructions**: Prepare Apify account; ensure Node 18+. Do not install Playwright browsers yet; we’ll run in Apify environment.

- [x] Step 2: Define input schema for Apify UI and validation
  - **Task**: Implement `INPUT_SCHEMA.json` aligned with the provided specification and matching Zod schema for runtime validation.
  - **Files**:
    - `INPUT_SCHEMA.json`: JSON schema for Apify console form and validation.
    - `src/schema.ts`: Zod schema mirroring `INPUT_SCHEMA.json`; export `parseInput`.
  - **Step Dependencies**: Step 1
  - **User Instructions**: None

- [x] Step 3: Create base TypeScript types and constants
  - **Task**: Define input/output types, profile/post models, enums for sort options, and constants for defaults.
  - **Files**:
    - `src/types.ts`: `ScraperInput`, `InfluencerProfile`, `InfluencerPost`, `EngagementStats`, `SortBy`, `OutputFormat`.
    - `src/constants.ts`: Defaults (concurrency, retries, timeouts), regex constants, selectors.
  - **Step Dependencies**: Step 2
  - **User Instructions**: None

## Utilities and Helpers
- [x] Step 4: Implement parsing utilities (numbers, dates, emails)
  - **Task**: Utilities to parse follower counts with K/M/B suffix, localized digits, date parsing for post timestamps, email extraction from bio/caption, and URL helpers.
  - **Files**:
    - `src/utils/parsing.ts`: `parseTikTokNumber`, `extractEmail`, `parseDateSafe`.
    - `src/utils/url.ts`: Search URL builders for keywords/hashtags, profile/video URL helpers.
  - **Step Dependencies**: Step 3
  - **User Instructions**: None

- [x] Step 5: Implement engagement and filtering utilities
  - **Task**: Compute engagement rate and apply filters per input criteria (followers range, bioContains, emailRequired, verifiedOnly, engagementRateMin, optional country).
  - **Files**:
    - `src/utils/engagement.ts`: `computeEngagementRate`, `aggregateEngagement`.
    - `src/filters.ts`: `filterProfiles(profiles, input)`.
  - **Step Dependencies**: Step 4
  - **User Instructions**: None

- [x] Step 6: Implement sorting and deduplication utilities
  - **Task**: Sorting by `followers_desc` and `engagement_desc`; dedupe profiles by username.
  - **Files**:
    - `src/sort.ts`: `sortProfiles(profiles, sortBy)`.
    - `src/utils/dedupe.ts`: `dedupeProfilesByUsername`.
  - **Step Dependencies**: Step 5
  - **User Instructions**: None

## Crawler Setup
- [x] Step 7: Configure PlaywrightCrawler with proxy, sessions, retries
  - **Task**: Create a reusable crawler factory with sensible defaults, stealth/fingerprints, session pooling, randomized delays, and request throttling.
  - **Files**:
    - `src/crawlers/crawlerFactory.ts`: `createCrawler({ pageHandler })` returning `PlaywrightCrawler`.
  - **Step Dependencies**: Step 3
  - **User Instructions**: In Apify, enable residential/datacenter proxy as needed; set `APIFY_PROXY_GROUPS` if required.

- [x] Step 8: Implement search crawler handler for keyword/hashtag discovery
  - **Task**: Handler to query TikTok search pages for each keyword/hashtag, collect video URLs and associated creator usernames, enqueue profile URLs.
  - **Files**:
    - `src/crawlers/searchHandler.ts`: `handleSearchPage(ctx, input)`, extraction logic, enqueue profiles to RequestQueue with unique keys.
  - **Step Dependencies**: Step 7, Step 4
  - **User Instructions**: None

- [x] Step 9: Implement profile crawler handler
  - **Task**: Handler to visit profile pages, extract username, follower count, bio, verified badge, public email (if present), and recent posts up to `maxPostsPerProfile` with their stats and timestamps.
  - **Files**:
    - `src/crawlers/profileHandler.ts`: `handleProfilePage(ctx, input)`, DOM selectors, scrolling for posts, extraction and normalization.
  - **Step Dependencies**: Step 7, Step 4
  - **User Instructions**: None

## Orchestration and Data Processing
- [x] Step 10: Implement main actor flow
  - **Task**: Wire input parsing, initialize RequestQueue, seed search requests for each keyword/hashtag, run crawler with both handlers, collect raw results in-memory or via dataset intermediate store.
  - **Files**:
    - `src/main.ts`: `Apify.main(async () => { ... })` orchestration; context logging; seeding; run; collecting results.
  - **Step Dependencies**: Steps 2, 7–9
  - **User Instructions**: None

- [x] Step 11: Compute engagement, filter, sort, and cap results
  - **Task**: After scraping, compute engagement metrics per profile, apply filters, sort per `sortBy`, and enforce `maxProfiles`.
  - **Files**:
    - `src/postProcess.ts`: `postProcessProfiles(rawProfiles, input)`.
  - **Step Dependencies**: Steps 5–6, 10
  - **User Instructions**: None

## Output and Integration
- [x] Step 12: Write results to Apify Dataset and KV store in requested format
  - **Task**: Push processed profiles to dataset; generate final output in `OUTPUT.json` or `OUTPUT.csv` in Key-Value Store; store metadata.
  - **Files**:
    - `src/output.ts`: `writeOutputs(profiles, input)`.
  - **Step Dependencies**: Step 11
  - **User Instructions**: None

- [x] Step 13: Add usage documentation and examples
  - **Task**: Provide README with actor explanation, example input JSON, sample output (truncated), Apify REST run examples, and n8n integration instructions.
  - **Files**:
    - `README.md`: Overview, features, input parameters table, REST examples, n8n HTTP Request + Wait/Fetch Dataset steps, troubleshooting.
    - `examples/input.json`: Example aligned with spec.
    - `examples/sample-output.json`: Anonymized/sample output format.
  - **Step Dependencies**: Step 12
  - **User Instructions**: Replace sample inputs with your own keywords; in n8n, use HTTP Request node to POST to Apify Run endpoint and follow dataset URL to fetch results.

## Error Handling, Resilience, and Limits
- [x] Step 14: Implement robust error handling and retry/backoff logic
  - **Task**: Global and per-request error handlers, retry with exponential backoff, capture failure reasons, skip blocked pages, respect max retries.
  - **Files**:
    - `src/crawlers/errorHandling.ts`: helpers for `failedRequestHandler`, `onError` hooks.
    - Update `src/crawlers/crawlerFactory.ts`: integrate error handling hooks.
  - **Step Dependencies**: Step 7, Step 10
  - **User Instructions**: Consider increasing proxies if encountering frequent blocks.

- [x] Step 15: Add rate limiting and randomized delays
  - **Task**: Tune concurrency and introduce jittered delays between navigations/scrolls; optional `maxRequestsPerMinute` throttle.
  - **Files**:
    - `src/crawlers/throttle.ts`: `waitRandom(minMs, maxMs)`, optional simple token bucket.
    - Update `src/crawlers/profileHandler.ts` and `src/crawlers/searchHandler.ts`: use jittered waits.
  - **Step Dependencies**: Step 7–9
  - **User Instructions**: Adjust concurrency and delays in `src/constants.ts` for stability vs speed.

## Testing
- [x] Step 16: Unit tests for utilities and post-processing
  - **Task**: Tests for number parsing, email extraction, engagement calculation, filtering, sorting.
  - **Files**:
    - `tests/parsing.test.ts`
    - `tests/engagement.test.ts`
    - `tests/filters.test.ts`
    - `tests/sort.test.ts`
    - `vitest.config.ts`
  - **Step Dependencies**: Steps 4–6, 11
  - **User Instructions**: Run `npm test`. These tests do not call TikTok.

- [x] Step 17: Integration test with mocked HTML fixtures
  - **Task**: Simulate profile and search pages with fixtures to test handlers without live network calls.
  - **Files**:
    - `tests/fixtures/profile.html`
    - `tests/fixtures/search.html`
    - `tests/handlers.test.ts`: use Playwright to load fixtures and run extraction functions.
  - **Step Dependencies**: Steps 8–9
  - **User Instructions**: Run `npm test`. Skips when Playwright not installed locally; run in CI with `npx playwright install --with-deps` if needed.

## Build, CI, and Deployment
- [x] Step 18: Build pipeline and linting
  - **Task**: Configure bundler, linting, and format scripts.
  - **Files**:
    - `tsup.config.ts` or `esbuild` script in `package.json`.
    - `.eslintrc.cjs` (optional), `.prettierrc` (optional).
  - **Step Dependencies**: Step 1
  - **User Instructions**: None

- [x] Step 19: Add GitHub Actions CI (optional but recommended)
  - **Task**: CI workflow to install, build, and run tests; cache dependencies.
  - **Files**:
    - `.github/workflows/ci.yml`: Node matrix (v18), build, test.
  - **Step Dependencies**: Steps 16–18
  - **User Instructions**: Set repo if using GitHub.

- [x] Step 20: Apify deployment configuration and push
  - **Task**: Ensure actor runs with `node main.js` from `dist`; add `apify push` config and notes for Playwright in Apify.
  - **Files**:
    - Update `apify.json`: `builds`, `env` (e.g., `APIFY_DEFAULT_DATASET_ID` if necessary).
    - Update `package.json`: `apify` script and `build` output to `dist/`.
  - **Step Dependencies**: Steps 10, 12, 18
  - **User Instructions**: 
    - Run `npm install`.
    - Run `npm run build`.
    - Run `npx apify login` (once), then `npx apify push` to deploy.
    - In Apify, configure proxy groups and max concurrency if needed.

## Polishing and Edge Cases
- [x] Step 21: Country/location heuristic support (best-effort)
  - **Task**: Attempt to infer country from bio keywords, language/locale indicators, or region labels if present; document limitations.
  - **Files**:
    - `src/utils/location.ts`: simple heuristics and keyword maps.
    - Update `src/filters.ts`: incorporate `country` filter if inferred.
  - **Step Dependencies**: Steps 5, 11
  - **User Instructions**: Provide country codes or names; accuracy is best-effort.

- [x] Step 22: Robust selectors and fallback strategies
  - **Task**: Add multiple selector strategies and content-script-based extraction if DOM varies; guard for missing fields.
  - **Files**:
    - Update `src/crawlers/profileHandler.ts` and `src/crawlers/searchHandler.ts`: alternative selectors, try/catch guards.
  - **Step Dependencies**: Steps 8–9
  - **User Instructions**: None

- [x] Step 23: Final validation and output schema stabilization
  - **Task**: Validate the final output structure; ensure all fields are present with safe defaults; include `runId`, `generatedAt`.
  - **Files**:
    - `src/types.ts`: finalize `InfluencerProfile` and `InfluencerPost` fields (optional fields marked).
    - `src/output.ts`: include metadata and version in KV store output.
  - **Step Dependencies**: Step 12
  - **User Instructions**: None