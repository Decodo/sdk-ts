# Decodo TypeScript SDK

[![](https://dcbadge.limes.pink/api/server/https://discord.gg/Ja8dqKgvbZ)](https://discord.gg/Ja8dqKgvbZ)
[![Install MCP Server](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/en-US/install-mcp?name=Decodo&config=eyJ1cmwiOiJodHRwczovL21jcC5kZWNvZG8uY29tL21jcCIsImhlYWRlcnMiOnsiQXV0aG9yaXphdGlvbiI6IkJhc2ljIDx3ZWJfYWR2YW5jZWRfdG9rZW4%2BIn19)

<p align="center">
<a href="https://dashboard.decodo.com/integrations?utm_source=github&utm_medium=social&utm_campaign=mcp_server"> <img src="https://github.com/user-attachments/assets/a1e52a9e-3da1-4081-b3c6-053aafb8f196"/></a>

The official TypeScript SDK for the Decodo Web Scraping API.

Build strongly typed scraping workflows for search engines, eCommerce platforms, social media, AI tools, and more using the Decodo Web Scraping API.

- Fully typed targets and parameters with IDE autocomplete
- Sync, async, and batch scraping methods
- Native `fetch` support, Node.js 18+
- Typed error hierarchy for safer integrations
- Built for TypeScript and modern JavaScript runtimes

# What is Decodo TypeScript SDK?

Decodo TypeScript SDK is the official TypeScript SDK for the Decodo Web Scraping API. It provides a typed interface for interacting with Decodo targets like Google, Amazon, TikTok, Reddit, YouTube, ChatGPT, Perplexity, and more.

Instead of manually constructing HTTP requests and validating payloads, you can work with fully typed methods and target-specific parameters directly in your editor.

# Why use the SDK?

- **Strong typing and autocomplete**. Target parameters are fully typed for better DX and fewer mistakes.
- **Unified scraping interface**. Work with search engines, eCommerce platforms, social media, and AI tools through one SDK.
- **Async and batch workflows**. Create scraping tasks, poll statuses, and process batches at scale.
- **Typed errors**. Handle authentication, validation, timeout, and rate-limit failures safely.
- **Minimal setup**. Uses native `fetch`, no additional HTTP client required.

## Requirements

- Node.js >= 18 (for native `fetch`)
- TypeScript >= 5.0 (recommended for best type inference)

## Installation

```bash
npm install --save @decodo/sdk-ts
```

## Quick start

Create a new project:

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
<br />

```sh
node -e "let p=require('./package.json'); p.type='module'; require('fs').writeFileSync('./package.json', JSON.stringify(p, null, 2))"
```

</details>

Get a Web Scraping API basic authentication token from the [Decodo dashboard](https://dashboard.decodo.com/welcome) and use it in the following example:

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

Run the script:

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

| Parameter | Description |
| --- | --- |
| `token` | Web Scraping API basic authentication token |
| `timeoutMs` | Request timeout in milliseconds (default: 180000) |

## Web Scraping API

Access the API via `client.webScrapingApi`.

The snippets below assume you have already imported `Target` (and `DecodoClient` where a client is constructed), for example:

```typescript
import { DecodoClient, Target } from '@decodo/sdk-ts';
```

### Sync scrape

Waits for the scraping result before returning:

```typescript
const result = await client.webScrapingApi.scrape({
  target: Target.AmazonProduct,
  query: 'B09H74FXNW',
  parse: true,
});
```

### Async scrape

Creates a scraping task and returns immediately. Poll separately for task status and results:

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

Send multiple queries or URLs in a single request:

```typescript
const batch = await client.webScrapingApi.scrapeBatch({
  target: Target.GoogleSearch,
  query: ['coffee', 'tea', 'juice'],
  parse: true,
});

const coffeeTaskId = batch.queries[0].id;

await client.webScrapingApi.getResults(coffeeTaskId);
```

## Supported targets

Each target accepts one primary input parameter (`url`, `query`, `product_id`, or `prompt`) together with optional configuration. The examples below show the minimum payload to call `client.webScrapingApi.scrape(...)`.

### Search engines

| Target | Description | Example |
| --- | --- | --- |
| `Target.GoogleSearch` | Google Search results for a query. | `{ target: Target.GoogleSearch, query: "coffee shops" }` |
| `Target.GoogleMaps` | Google Maps search results. | `{ target: Target.GoogleMaps, query: "coffee shops brooklyn" }` |
| `Target.GoogleShoppingSearch` | Google Shopping search results. | `{ target: Target.GoogleShoppingSearch, query: "laptop" }` |
| `Target.GoogleSuggest` | Google Autocomplete suggestions. | `{ target: Target.GoogleSuggest, query: "coffee" }` |
| `Target.GoogleLens` | Google Lens reverse image search. | `{ target: Target.GoogleLens, query: "https://example.com/cat.jpg" }` |
| `Target.BingSearch` | Bing Search results. | `{ target: Target.BingSearch, query: "electric vehicles" }` |

### eCommerce

| Target | Description | Example |
| --- | --- | --- |
| `Target.AmazonProduct` | Amazon product detail page by ASIN. | `{ target: Target.AmazonProduct, query: "B09H74FXNW" }` |
| `Target.AmazonSearch` | Amazon search results. | `{ target: Target.AmazonSearch, query: "laptop" }` |
| `Target.AmazonPricing` | Amazon pricing and offers. | `{ target: Target.AmazonPricing, query: "B09H74FXNW" }` |
| `Target.WalmartProduct` | Walmart product page by product ID. | `{ target: Target.WalmartProduct, product_id: "15296401808" }` |
| `Target.TargetProduct` | Target.com product page by product ID. | `{ target: Target.TargetProduct, product_id: "92186007" }` |
| `Target.Ecommerce` | Generic eCommerce page with parser. | `{ target: Target.Ecommerce, url: "https://example.com/product/123" }` |

### Social media

| Target | Description | Example |
| --- | --- | --- |
| `Target.RedditPost` | Reddit post by URL. | `{ target: Target.RedditPost, url: "https://reddit.com/r/nba/..." }` |
| `Target.RedditSubreddit` | Reddit subreddit by URL. | `{ target: Target.RedditSubreddit, url: "https://reddit.com/r/nba/" }` |
| `Target.YoutubeVideo` | YouTube video by ID. | `{ target: Target.YoutubeVideo, query: "dFu9aKJoqGg" }` |
| `Target.YoutubeSearch` | YouTube search results. | `{ target: Target.YoutubeSearch, query: "ambient music" }` |
| `Target.TiktokPost` | TikTok post by URL. | `{ target: Target.TiktokPost, url: "https://www.tiktok.com/@nba/video/..." }` |

### AI tools

| Target | Description | Example |
| --- | --- | --- |
| `Target.Chatgpt` | ChatGPT response for a prompt. | `{ target: Target.Chatgpt, prompt: "What are the top three dog breeds?" }` |
| `Target.Perplexity` | Perplexity response for a prompt. | `{ target: Target.Perplexity, prompt: "What causes seasonal allergies?" }` |
| `Target.GoogleAiMode` | Google AI Mode response. | `{ target: Target.GoogleAiMode, query: "What are the top three dog breeds?" }` |

### Universal scraping

| Target | Description | Example |
| --- | --- | --- |
| `Target.Universal` | Any URL via the universal scraper. | `{ target: Target.Universal, url: "https://example.com" }` |
| `Target.Google` | Raw Google URL scraping. | `{ target: Target.Google, url: "https://google.com/search?q=laptop" }` |
| `Target.Amazon` | Raw Amazon URL scraping. | `{ target: Target.Amazon, url: "https://amazon.com/dp/B09H74FXNW" }` |

> `Target.UniversalEcommerce` isn't listed above because it doesn't accept a primary input parameter like `url`, `query`, `product_id`, or `prompt`. It only accepts optional configuration fields such as `callback_url`.

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

## Related repositories

- [Web Scraping API](https://github.com/Decodo/Web-Scraping-API)
- [Decodo MCP Server](https://github.com/Decodo/mcp-server)
- [Decodo OpenClaw Skill](https://github.com/Decodo/decodo-openclaw-skill)

## Try it

Start building scraping workflows with the Decodo Web Scraping API:

- [Start for free](https://dashboard.decodo.com/)
- [Documentation](https://help.decodo.com/docs/introduction)
- [Discord](https://discord.gg/Ja8dqKgvbZ)

## License

Released under the [MIT License](https://github.com/Decodo/Decodo/blob/master/LICENSE).
