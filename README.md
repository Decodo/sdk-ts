# @decodo/sdk-ts

Official TypeScript SDK for the Decodo Web Scraping API.

Features:

- Strongly typed per-target parameters with full IDE autocomplete
- Sync, async, and batch scraping
- Zero runtime dependencies (uses native `fetch`, Node 18+)
- Typed error hierarchy

## Installation

```bash
npm install @decodo/sdk-ts
```

## Quick start

```typescript
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
console.log(result.results[0].content);
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
console.log(batch.id);
```

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

## Requirements

- Node.js >= 18 (for native `fetch`)
- TypeScript >= 5.0 (recommended for best type inference)
