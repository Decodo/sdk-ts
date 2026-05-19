# @decodo/sdk-ts

Official TypeScript SDK for the Decodo Web Scraping API.

Features:

- Strongly typed per-target parameters with full IDE autocomplete
- Sync, async, and batch scraping
- Uses native `fetch`, Node 18+
- Typed error hierarchy

## Requirements

- Node.js >= 18 (for native `fetch`)
- TypeScript >= 5.0 (recommended for best type inference)

## Installation

```bash
npm install --save @decodo/sdk-ts
```

## Quick start

```sh
mkdir scrape-with-decodo
cd scrape-with-decodo

npm init -y
npm install --save @decodo/sdk-ts

touch main.js
```

<details>
<summary>Optional: prevent module type warning</summary>

Run the following script to switch to ESM modules:

```sh
node -e "let p=require('./package.json'); p.type='module'; require('fs').writeFileSync('./package.json', JSON.stringify(p, null, 2))"
```

</details>

<br />

Obtain a basic auth token from the [Decodo dashboard](https://dashboard.decodo.com/welcome) and use it in the following sample:

```typescript
// main.js
import { DecodoClient, Target } from '@decodo/sdk-ts';

const client = new DecodoClient({
  webScrapingApi: {
    token: '<basic_auth_token>',
  },
});

const result = await client.webScrapingApi.scrape({
  target: Target.GoogleSearch,
  query: 'coffee shops',
  geo: 'United States',
  parse: true,
});
console.log(JSON.stringify(result, null, 2));
```

Then run the scraping task with:

```
node main.js
```

## Configuration

```typescript
const client = new DecodoClient({
  webScrapingApi: {
    token: '<basic_auth_token>',
  },
  timeoutMs: 120_000, // optional, request timeout in ms (default: 180s)
});
```

## Web Scraping API

Access via `client.webScrapingApi`.

The snippets below assume you have already imported `Target` (and `DecodoClient` where a client is constructed), for example:

```typescript
import { DecodoClient, Target } from '@decodo/sdk-ts';
```

### Sync scrape

Blocks until the scraping result is ready:

```typescript
const result = await client.webScrapingApi.scrape({
  target: Target.AmazonProduct,
  query: 'B09H74FXNW',
  parse: true,
});
```

### Async scrape

Creates a task and returns immediately. Poll separately for results:

```typescript
const task = await client.webScrapingApi.scrapeAsync({
  target: Target.GoogleSearch,
  query: 'laptop reviews',
  parse: true,
});

const meta = await client.webScrapingApi.getStatus(task.id);
console.log(meta.status); // 'pending' | 'done' | 'faulted'

const results = await client.webScrapingApi.getResults(task.id);
```

### Batch scrape

Send multiple URLs or queries in a single request:

```typescript
const batch = await client.webScrapingApi.scrapeBatch({
  target: Target.GoogleSearch,
  query: ['coffee', 'tea', 'juice'],
  parse: true,
});

const coffeeTaskId = batch.queries[0].id;

await client.webScrapingApi.getResults(coffeeTaskId);
```

## Available targets

Each target accepts a single required input parameter (`url`, `query`, `product_id`, or `prompt`) plus optional configuration. The examples below show the minimum payload to call `client.webScrapingApi.scrape(...)`.

| Target | Description | Example |
| --- | --- | --- |
| `Target.GoogleSearch` | Google Search results for a query. | `{ target: Target.GoogleSearch, query: "coffee shops" }` |
| `Target.GoogleTravelHotels` | Google Travel hotel listings. | `{ target: Target.GoogleTravelHotels, query: "trivago" }` |
| `Target.GoogleTrendsExplore` | Google Trends Explore data for a topic. | `{ target: Target.GoogleTrendsExplore, query: "seo optimization" }` |
| `Target.GoogleShoppingSearch` | Google Shopping search results. | `{ target: Target.GoogleShoppingSearch, query: "laptop" }` |
| `Target.GoogleShoppingProduct` | A single product page on Google Shopping. | `{ target: Target.GoogleShoppingProduct, query: "1234567890" }` |
| `Target.Google` | A raw Google URL (search, news, images, etc.). | `{ target: Target.Google, url: "https://www.google.com/search?q=laptop" }` |
| `Target.GoogleSuggest` | Google search autocomplete suggestions. | `{ target: Target.GoogleSuggest, query: "coffee" }` |
| `Target.GoogleMaps` | Google Maps search results. | `{ target: Target.GoogleMaps, query: "coffee shops brooklyn" }` |
| `Target.GoogleAiMode` | Google AI Mode response for a prompt. | `{ target: Target.GoogleAiMode, query: "What are the top three dog breeds?" }` |
| `Target.GoogleAds` | Google Ads results for a query. | `{ target: Target.GoogleAds, query: "laptop" }` |
| `Target.GoogleLens` | Google Lens reverse image search by image URL. | `{ target: Target.GoogleLens, query: "https://example.com/cat.jpg" }` |
| `Target.BingSearch` | Bing Search results for a query. | `{ target: Target.BingSearch, query: "electric vehicles" }` |
| `Target.Bing` | A raw Bing URL. | `{ target: Target.Bing, url: "https://www.bing.com/search?q=laptop" }` |
| `Target.YoutubeTranscript` | Transcript for a YouTube video ID. | `{ target: Target.YoutubeTranscript, query: "dFu9aKJoqGg" }` |
| `Target.AmazonProduct` | Amazon product detail page by ASIN. | `{ target: Target.AmazonProduct, query: "B09H74FXNW" }` |
| `Target.AmazonPricing` | Amazon pricing/offers for an ASIN. | `{ target: Target.AmazonPricing, query: "B09H74FXNW" }` |
| `Target.AmazonSearch` | Amazon search results for a query. | `{ target: Target.AmazonSearch, query: "laptop" }` |
| `Target.AmazonSellers` | Amazon seller profile by seller ID. | `{ target: Target.AmazonSellers, query: "A1R0Z7FJGTKESH" }` |
| `Target.AmazonBestsellers` | Amazon bestsellers list for a category. | `{ target: Target.AmazonBestsellers, query: "mobile-apps" }` |
| `Target.Amazon` | A raw Amazon URL. | `{ target: Target.Amazon, url: "https://www.amazon.com/dp/B09H74FXNW" }` |
| `Target.Ecommerce` | Generic ecommerce page by URL with parser. | `{ target: Target.Ecommerce, url: "https://example.com/product/123" }` |
| `Target.WalmartProduct` | Walmart product page by product ID. | `{ target: Target.WalmartProduct, product_id: "15296401808" }` |
| `Target.WalmartSearch` | Walmart search results for a query. | `{ target: Target.WalmartSearch, query: "wireless earbuds" }` |
| `Target.Walmart` | A raw Walmart URL. | `{ target: Target.Walmart, url: "https://www.walmart.com/cp/christmas-shop/1386088" }` |
| `Target.TargetProduct` | Target.com product page by product ID. | `{ target: Target.TargetProduct, product_id: "92186007" }` |
| `Target.TargetSearch` | Target.com search results for a query. | `{ target: Target.TargetSearch, query: "laptop" }` |
| `Target.Target` | A raw Target.com URL. | `{ target: Target.Target, url: "https://www.target.com/p/-/A-92186007" }` |
| `Target.LowesSearch` | Lowe's search results for a query. | `{ target: Target.LowesSearch, query: "drill" }` |
| `Target.Universal` | Any URL via the universal scraper. | `{ target: Target.Universal, url: "https://www.example.com" }` |
| `Target.Chatgpt` | ChatGPT response for a prompt. | `{ target: Target.Chatgpt, prompt: "What are the top three dog breeds?" }` |
| `Target.Perplexity` | Perplexity response for a prompt. | `{ target: Target.Perplexity, prompt: "What causes seasonal allergies?" }` |
| `Target.Bbb` | Better Business Bureau page by URL. | `{ target: Target.Bbb, url: "https://www.bbb.org/search?find_text=Tree+Service" }` |
| `Target.Autotrader` | Autotrader listing or search page by URL. | `{ target: Target.Autotrader, url: "https://www.autotrader.co.uk/car-search?channel=cars" }` |
| `Target.Mobile` | mobile.de listing or search page by URL. | `{ target: Target.Mobile, url: "https://suchen.mobile.de/fahrzeuge/search.html?s=Car" }` |
| `Target.Airbnb` | Airbnb listing or search page by URL. | `{ target: Target.Airbnb, url: "https://www.airbnb.com/s/New-York-City--New-York/homes" }` |
| `Target.AppleAppStore` | Apple App Store page by URL. | `{ target: Target.AppleAppStore, url: "https://apps.apple.com/us/iphone/games" }` |
| `Target.InstagramGraphqlProfile` | Instagram profile by username. | `{ target: Target.InstagramGraphqlProfile, query: "nba" }` |
| `Target.TiktokPost` | TikTok post by URL. | `{ target: Target.TiktokPost, url: "https://www.tiktok.com/@nba/video/7255379108241198378" }` |
| `Target.TiktokShopSearch` | TikTok Shop search results for a query. | `{ target: Target.TiktokShopSearch, query: "necklace" }` |
| `Target.TiktokShopProduct` | TikTok Shop product by product ID. | `{ target: Target.TiktokShopProduct, product_id: "1731541214379741272" }` |
| `Target.Tiktok` | A raw TikTok URL. | `{ target: Target.Tiktok, url: "https://www.tiktok.com/@nba/video/7255379108241198378" }` |
| `Target.RedditPost` | Reddit post by URL. | `{ target: Target.RedditPost, url: "https://www.reddit.com/r/nba/comments/17jrqc5/" }` |
| `Target.RedditSubreddit` | Reddit subreddit by URL. | `{ target: Target.RedditSubreddit, url: "https://www.reddit.com/r/nba/" }` |
| `Target.RedditUser` | Reddit user profile by URL. | `{ target: Target.RedditUser, url: "https://www.reddit.com/user/IWasRightOnce/" }` |
| `Target.YoutubeVideo` | YouTube video by video ID. | `{ target: Target.YoutubeVideo, query: "dFu9aKJoqGg" }` |
| `Target.YoutubeMetadata` | YouTube video metadata by video ID. | `{ target: Target.YoutubeMetadata, query: "dFu9aKJoqGg" }` |
| `Target.YoutubeSearch` | YouTube search results for a query. | `{ target: Target.YoutubeSearch, query: "How to care for chinchillas" }` |
| `Target.YoutubeSearchMax` | YouTube search results with extra filters. | `{ target: Target.YoutubeSearchMax, query: "How to care for chinchillas" }` |
| `Target.YoutubeSubtitles` | YouTube subtitles by video ID. | `{ target: Target.YoutubeSubtitles, query: "L8zSWbQN-v8" }` |
| `Target.YoutubeChannel` | YouTube channel by handle. | `{ target: Target.YoutubeChannel, query: "@decodo_official" }` |

Note: `Target.UniversalEcommerce` is not listed above — it does not accept a `url`, `query`, `product_id`, or `prompt` parameter, only optional configuration like `callback_url`.

## Error handling

The SDK throws typed errors that map to API error codes:

```typescript
import {
  DecodoError,
  AuthenticationError,
  RateLimitError,
  ValidationError,
  TimeoutError,
  Target,
} from '@decodo/sdk-ts';

try {
  await client.webScrapingApi.scrape({
    target: Target.GoogleSearch,
    query: 'test',
    parse: true,
  });
} catch (err) {
  if (err instanceof AuthenticationError) {
    // 401/403 — bad credentials
  } else if (err instanceof RateLimitError) {
    // 429 — too many requests
  } else if (err instanceof ValidationError) {
    // 422 — invalid parameters
    console.log(err.errors);
  } else if (err instanceof TimeoutError) {
    // request timed out
  }
}
```
