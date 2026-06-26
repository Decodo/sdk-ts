# Decodo TypeScript SDK

![Node.js](https://img.shields.io/badge/node-%3E%3D18-green)
![License](https://img.shields.io/badge/license-MIT-blue)

[![](https://dcbadge.limes.pink/api/server/https://discord.gg/Ja8dqKgvbZ)](https://discord.gg/Ja8dqKgvbZ)

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

- Node.js 18+ (for native `fetch`)
- TypeScript 5.0+ (recommended for best type inference)

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

<details>
<summary>Example response</summary>

```json
{
  "results": [
    {
      "content": {
        "results": {
          "last_visible_page": 10,
          "page": 1,
          "parse_status_code": 12000,
          "results": {
            "local_pack": [
              {
                "items": [
                  {
                    "address": "Rochester, NY",
                    "paid": false,
                    "pos": 1,
                    "rating": 4.9,
                    "rating_count": 1700,
                    "subtitle": "Coffee shop",
                    "title": "Albunn Coffee House"
                  },
                  {
                    "address": "Rochester, NY",
                    "paid": false,
                    "pos": 2,
                    "rating": 4.8,
                    "rating_count": 937,
                    "subtitle": "Coffee shop",
                    "title": "Layali Coffee House"
                  },
                  {
                    "address": "Ocean Township, NJ",
                    "paid": false,
                    "pos": 3,
                    "rating": 4.9,
                    "rating_count": 124,
                    "subtitle": "Coffee shop",
                    "title": "Ocean Brew Co."
                  }
                ],
                "pos_overall": 1
              }
            ],
            "navigation": [
              {
                "pos": 1,
                "title": "AI Mode",
                "url": "/search?q=coffee+shops&sca_esv=525e608177515078&hl=en&gl=us&udm=50&fbs=ADc_l-aN0CWEZBOHjofHoaMMDiKp9lEhFAN_4ain3HSNQWw-mOdEry7qMdvK9DVYTQhhmGPzdLibceP-axzNRyypn83aa9v77RK3nAyJbS7Ww3c5hEZ41MHuBwA1cj9fLdcvZl39JyX99GA6dTRuy8597fUa5gVhW6ji9TQaHsuXH4CUtx2nUSCgjR6EycjMi9JpkD60fmHj94qqvvZFpMtWVwcBzf9XLw&aep=1&ntc=1&sa=X&ved=2ahUKEwiq0P6Xv8yUAxUPNvsDHaaIEQsQ2J8OegQIEhAD"
              },
              {
                "pos": 2,
                "title": "All"
              },
              {
                "pos": 3,
                "title": "Shopping",
                "url": "/search?sca_esv=525e608177515078&hl=en&gl=us&udm=28&fbs=ADc_l-aN0CWEZBOHjofHoaMMDiKp9lEhFAN_4ain3HSNQWw-mOdEry7qMdvK9DVYTQhhmGPzdLibceP-axzNRyypn83aa9v77RK3nAyJbS7Ww3c5hEZ41MHuBwA1cj9fLdcvZl39JyX99GA6dTRuy8597fUa5gVhW6ji9TQaHsuXH4CUtx2nUSCgjR6EycjMi9JpkD60fmHj94qqvvZFpMtWVwcBzf9XLw&q=coffee+shops&ved=1t:220175&ictx=111"
              },
              {
                "pos": 4,
                "title": "Maps",
                "url": "https://maps.google.com/maps?sca_esv=525e608177515078&hl=en&gl=us&output=search&q=coffee+shops&source=lnms&fbs=ADc_l-aN0CWEZBOHjofHoaMMDiKp9lEhFAN_4ain3HSNQWw-mOdEry7qMdvK9DVYTQhhmGPzdLibceP-axzNRyypn83aa9v77RK3nAyJbS7Ww3c5hEZ41MHuBwA1cj9fLdcvZl39JyX99GA6dTRuy8597fUa5gVhW6ji9TQaHsuXH4CUtx2nUSCgjR6EycjMi9JpkD60fmHj94qqvvZFpMtWVwcBzf9XLw&entry=mc&ved=1t:200715&ictx=111"
              },
              {
                "pos": 5,
                "title": "Images",
                "url": "/search?sca_esv=525e608177515078&hl=en&gl=us&udm=2&fbs=ADc_l-aN0CWEZBOHjofHoaMMDiKp9lEhFAN_4ain3HSNQWw-mOdEry7qMdvK9DVYTQhhmGPzdLibceP-axzNRyypn83aa9v77RK3nAyJbS7Ww3c5hEZ41MHuBwA1cj9fLdcvZl39JyX99GA6dTRuy8597fUa5gVhW6ji9TQaHsuXH4CUtx2nUSCgjR6EycjMi9JpkD60fmHj94qqvvZFpMtWVwcBzf9XLw&q=coffee+shops&sa=X&ved=2ahUKEwiq0P6Xv8yUAxUPNvsDHaaIEQsQtKgLegQIFhAB"
              },
              {
                "pos": 6,
                "title": "Short videos",
                "url": "/search?sca_esv=525e608177515078&hl=en&gl=us&udm=39&fbs=ADc_l-aN0CWEZBOHjofHoaMMDiKp9lEhFAN_4ain3HSNQWw-mOdEry7qMdvK9DVYTQhhmGPzdLibceP-axzNRyypn83aa9v77RK3nAyJbS7Ww3c5hEZ41MHuBwA1cj9fLdcvZl39JyX99GA6dTRuy8597fUa5gVhW6ji9TQaHsuXH4CUtx2nUSCgjR6EycjMi9JpkD60fmHj94qqvvZFpMtWVwcBzf9XLw&q=coffee+shops&sa=X&ved=2ahUKEwiq0P6Xv8yUAxUPNvsDHaaIEQsQs6gLegQIFxAB"
              },
              {
                "pos": 7,
                "title": "Videos",
                "url": "/search?sca_esv=525e608177515078&hl=en&gl=us&udm=7&fbs=ADc_l-aN0CWEZBOHjofHoaMMDiKp9lEhFAN_4ain3HSNQWw-mOdEry7qMdvK9DVYTQhhmGPzdLibceP-axzNRyypn83aa9v77RK3nAyJbS7Ww3c5hEZ41MHuBwA1cj9fLdcvZl39JyX99GA6dTRuy8597fUa5gVhW6ji9TQaHsuXH4CUtx2nUSCgjR6EycjMi9JpkD60fmHj94qqvvZFpMtWVwcBzf9XLw&q=coffee+shops&sa=X&ved=2ahUKEwiq0P6Xv8yUAxUPNvsDHaaIEQsQtKgLegQIGBAB"
              },
              {
                "pos": 8,
                "title": "Forums",
                "url": "/search?sca_esv=525e608177515078&hl=en&gl=us&udm=18&fbs=ADc_l-aN0CWEZBOHjofHoaMMDiKp9lEhFAN_4ain3HSNQWw-mOdEry7qMdvK9DVYTQhhmGPzdLibceP-axzNRyypn83aa9v77RK3nAyJbS7Ww3c5hEZ41MHuBwA1cj9fLdcvZl39JyX99GA6dTRuy8597fUa5gVhW6ji9TQaHsuXH4CUtx2nUSCgjR6EycjMi9JpkD60fmHj94qqvvZFpMtWVwcBzf9XLw&q=coffee+shops&sa=X&ved=2ahUKEwiq0P6Xv8yUAxUPNvsDHaaIEQsQs6gLegUIuQEQAQ"
              },
              {
                "pos": 9,
                "title": "News",
                "url": "/search?sca_esv=525e608177515078&hl=en&gl=us&q=coffee+shops&tbm=nws&source=lnms&fbs=ADc_l-aN0CWEZBOHjofHoaMMDiKp9lEhFAN_4ain3HSNQWw-mOdEry7qMdvK9DVYTQhhmGPzdLibceP-axzNRyypn83aa9v77RK3nAyJbS7Ww3c5hEZ41MHuBwA1cj9fLdcvZl39JyX99GA6dTRuy8597fUa5gVhW6ji9TQaHsuXH4CUtx2nUSCgjR6EycjMi9JpkD60fmHj94qqvvZFpMtWVwcBzf9XLw&sa=X&ved=2ahUKEwiq0P6Xv8yUAxUPNvsDHaaIEQsQ0pQJegUItwEQAQ"
              },
              {
                "pos": 10,
                "title": "Web",
                "url": "/search?sca_esv=525e608177515078&hl=en&gl=us&udm=web&fbs=ADc_l-aN0CWEZBOHjofHoaMMDiKp9lEhFAN_4ain3HSNQWw-mOdEry7qMdvK9DVYTQhhmGPzdLibceP-axzNRyypn83aa9v77RK3nAyJbS7Ww3c5hEZ41MHuBwA1cj9fLdcvZl39JyX99GA6dTRuy8597fUa5gVhW6ji9TQaHsuXH4CUtx2nUSCgjR6EycjMi9JpkD60fmHj94qqvvZFpMtWVwcBzf9XLw&q=coffee+shops&sa=X&ved=2ahUKEwiq0P6Xv8yUAxUPNvsDHaaIEQsQs6gLegUIugEQAQ"
              },
              {
                "pos": 11,
                "title": "Books",
                "url": "/search?sca_esv=525e608177515078&hl=en&gl=us&q=coffee+shops&udm=36&source=lnms&fbs=ADc_l-aN0CWEZBOHjofHoaMMDiKp9lEhFAN_4ain3HSNQWw-mOdEry7qMdvK9DVYTQhhmGPzdLibceP-axzNRyypn83aa9v77RK3nAyJbS7Ww3c5hEZ41MHuBwA1cj9fLdcvZl39JyX99GA6dTRuy8597fUa5gVhW6ji9TQaHsuXH4CUtx2nUSCgjR6EycjMi9JpkD60fmHj94qqvvZFpMtWVwcBzf9XLw&sa=X&ved=2ahUKEwiq0P6Xv8yUAxUPNvsDHaaIEQsQ0pQJegUIuAEQAQ"
              }
            ],
            "organic": [
              {
                "desc": "For an alternate, local view, Eater has an interesting list of what it considers Philadelphia's 21 Essential Coffee Shops. Header image: Penn's Landing and ...Read more",
                "favicon_text": "Brian's Coffee Spot",
                "pos": 1,
                "pos_overall": 2,
                "title": "Philadelphia",
                "url": "https://www.brian-coffee-spot.com/the-coffee-spot-guide-to/usa-canada/philadelphia/",
                "url_shown": "https://www.brian-coffee-spot.com› usa-canada › phila..."
              },
              {
                "desc": "Which Pittsburgh coffee shops are worth your time? Our ever-expanding guide gets to the bottom of that question.Read more",
                "favicon_text": "Discover the Burgh",
                "pos": 2,
                "pos_overall": 3,
                "title": "48 Pittsburgh Coffee Shops to Grab a Delicious Brew",
                "url": "https://www.discovertheburgh.com/pittsburgh-coffee-shops/",
                "url_shown": "https://www.discovertheburgh.com› ... › Coffee"
              },
              {
                "desc": "Sep 29, 2016 — Best Coffee Shops in Atlanta · Octane · Dancing Goats Coffee Bar · Chrome Yellow Trading Co. · Revelator Coffee Company. Brash isn't the only ...Read more",
                "favicon_text": "ATL Bucket List",
                "pos": 3,
                "pos_overall": 4,
                "title": "Best Coffee Shops in Atlanta",
                "url": "https://www.atlbucketlist.com/2016/09/29/best-coffee-shops-in-atlanta/",
                "url_shown": "https://www.atlbucketlist.com› Food & Drink"
              },
              {
                "desc": "Atticus Coffee & Gifts (222 N Howard St, Spokane, WA // 509.747.0336) There is a lot to love about downtown's Atticus. Firstly, it's one of the most ...Read more",
                "favicon_text": "Spokane Eats",
                "pos": 4,
                "pos_overall": 6,
                "title": "BEST COFFEE IN SPOKANE",
                "url": "https://spokaneeats.net/best-coffee-in-spokane/",
                "url_shown": "https://spokaneeats.net› Blog"
              },
              {
                "desc": "Tucson has many excellent coffee shops including Exo Roast Co., Ren Coffeehouse, Presta Coffee Roasters and Ombre Coffee.",
                "favicon_text": "Globalphile",
                "pos": 5,
                "pos_overall": 7,
                "title": "The Best Coffee Shops in Tucson, AZ",
                "url": "https://globalphile.com/the-best-coffee-shops-in-tucson-az/",
                "url_shown": "https://globalphile.com› the-best-coffee-shops-in-tucson..."
              },
              {
                "desc": "Oct 30, 2025 — The Best Coffee Shops in Orange County, California: A Local's Guide · Brot Coffee Co. · Daydream Surf Shop – Newport Beach · Hidden House Coffee ...Read more",
                "favicon_text": "Lauren Belzer",
                "pos": 6,
                "pos_overall": 8,
                "title": "The Best Coffee Shops in Orange County, California",
                "url": "https://laurenbelz.com/best-coffee-orange-county/",
                "url_shown": "https://laurenbelz.com› best-coffee-orange-county"
              },
              {
                "desc": "Sep 11, 2024 — Writer Gene Kahane names his top five favorite local coffee shops around the island of Alameda, including LazyBird and The Local.",
                "favicon_text": "Alameda Post",
                "pos": 7,
                "pos_overall": 9,
                "title": "Five Favorite Coffee Shops",
                "url": "https://alamedapost.com/features/alameda-life/five-favorite-coffee-shops/",
                "url_shown": "https://alamedapost.com› Features › Alameda Life"
              },
              {
                "desc": "Jun 24, 2025 — 1. Royal Flamingo Coffee -> I Like It Like That · 2. Roosevelt Coffeehouse -> Olentangy River Brewing Company · 3. Ravello's Coffee -> The Daily ...Read more",
                "favicon_text": "Breakfast With Nick",
                "pos": 8,
                "pos_overall": 10,
                "title": "Columbus' Best Coffee Shops in Bars",
                "url": "https://breakfastwithnick.com/2025/06/24/the-best-coffee-shops-in-bars-columbus-ohio/",
                "url_shown": "https://breakfastwithnick.com› 2025/06/24 › the-best-c..."
              }
            ],
            "paid": [],
            "related_searches": [
              {
                "pos_overall": 11,
                "related_searches": [
                  "Best coffee shops",
                  "Coffee shops Pittsburgh",
                  "Coffee shops Strip District",
                  "Coffee shops Philadelphia",
                  "Coffee shops downtown Pittsburgh",
                  "Best coffee shops Pittsburgh",
                  "Best coffee shops in Philadelphia for working",
                  "Coffee Shops Sewickley"
                ],
                "related_searches_urls": [
                  "https://www.google.com/search?sca_esv=525e608177515078&hl=en&gl=us&q=Best+coffee+shops&sa=X&ved=2ahUKEwiq0P6Xv8yUAxUPNvsDHaaIEQsQ1QJ6BAg1EAE",
                  "https://www.google.com/search?sca_esv=525e608177515078&hl=en&gl=us&q=Coffee+shops+Pittsburgh&sa=X&ved=2ahUKEwiq0P6Xv8yUAxUPNvsDHaaIEQsQ1QJ6BAg8EAE",
                  "https://www.google.com/search?sca_esv=525e608177515078&hl=en&gl=us&q=Coffee+shops+Strip+District&sa=X&ved=2ahUKEwiq0P6Xv8yUAxUPNvsDHaaIEQsQ1QJ6BAg_EAE",
                  "https://www.google.com/search?sca_esv=525e608177515078&hl=en&gl=us&q=Coffee+shops+Philadelphia&sa=X&ved=2ahUKEwiq0P6Xv8yUAxUPNvsDHaaIEQsQ1QJ6BAhBEAE",
                  "https://www.google.com/search?sca_esv=525e608177515078&hl=en&gl=us&q=Coffee+shops+downtown+Pittsburgh&sa=X&ved=2ahUKEwiq0P6Xv8yUAxUPNvsDHaaIEQsQ1QJ6BAg-EAE",
                  "https://www.google.com/search?sca_esv=525e608177515078&hl=en&gl=us&q=Best+coffee+shops+Pittsburgh&sa=X&ved=2ahUKEwiq0P6Xv8yUAxUPNvsDHaaIEQsQ1QJ6BAg6EAE",
                  "https://www.google.com/search?sca_esv=525e608177515078&hl=en&gl=us&q=Best+coffee+shops+in+Philadelphia+for+working&sa=X&ved=2ahUKEwiq0P6Xv8yUAxUPNvsDHaaIEQsQ1QJ6BAg7EAE",
                  "https://www.google.com/search?sca_esv=525e608177515078&hl=en&gl=us&q=Coffee+Shops+Sewickley&sa=X&ved=2ahUKEwiq0P6Xv8yUAxUPNvsDHaaIEQsQ1QJ6BAg5EAE"
                ]
              }
            ],
            "search_information": {
              "no_results_for_original_query_found": false,
              "query": "coffee shops",
              "showing_results_for": "coffee shops",
              "time_taken_displayed": null,
              "total_results_count": 403000000
            },
            "total_results_count": 403000000,
            "what_people_are_saying": {
              "items": [
                {
                  "engagement_timeframe": "2 reactions, 3 days ago",
                  "pos": 1,
                  "source": "Facebook",
                  "title": "Will be working in Frederick every Monday for the foreseeable future (driving from Westminster)...what's your fave coffee shop in the area?",
                  "url": "https://www.facebook.com/groups/366748512662939/posts/968510169153434/"
                },
                {
                  "engagement_timeframe": "90+ comments, 18 hours ago",
                  "pos": 2,
                  "source": "Reddit",
                  "title": "Portland coffee roaster scoops up another empty Starbucks cafe",
                  "url": "https://www.reddit.com/r/Portland/comments/1tjmv4s/portland_coffee_roaster_scoops_up_another_empty/"
                },
                {
                  "engagement_timeframe": "1.5M+ views, 1 week ago",
                  "pos": 3,
                  "source": "Los Angeles",
                  "title": "Auntie Nid Coffee Shop 🇹🇭 aka ร้านป้านิดปากแดง กาแฟโบราณ (Pa Nid Pak Daeng Kafaeboran) #auntienidcoffeeshop #auntienid",
                  "url": "https://www.tiktok.com/@janiedevours/video/7640013933008440606"
                }
              ],
              "pos_overall": 5
            }
          },
          "url": "https://www.google.com/search?q=coffee+shops&hl=en&gl=us"
        },
        "errors": [],
        "status_code": 12000,
        "task_id": "7463508496927950850"
      },
      "headers": {},
      "status_code": 200,
      "url": "https://www.google.com/search?q=coffee+shops&hl=en&gl=us",
      "query": "coffee shops",
      "task_id": "7463508496927950850",
      "created_at": "2026-05-22 08:38:10",
      "updated_at": "2026-05-22 08:38:13"
    }
  ]
}
```

</details>

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
| `Target.GoogleSearch` | Google Search results for a query | `{ target: Target.GoogleSearch, query: "coffee shops" }` |
| `Target.GoogleMaps` | Google Maps search results | `{ target: Target.GoogleMaps, query: "coffee shops brooklyn" }` |
| `Target.GoogleShoppingSearch` | Google Shopping search results | `{ target: Target.GoogleShoppingSearch, query: "laptop" }` |
| `Target.GoogleSuggest` | Google Autocomplete suggestions | `{ target: Target.GoogleSuggest, query: "coffee" }` |
| `Target.GoogleLens` | Google Lens reverse image search | `{ target: Target.GoogleLens, query: "https://example.com/cat.jpg" }` |
| `Target.BingSearch` | Bing Search results | `{ target: Target.BingSearch, query: "electric vehicles" }` |

### eCommerce

| Target | Description | Example |
| --- | --- | --- |
| `Target.AmazonProduct` | Amazon product detail page by ASIN | `{ target: Target.AmazonProduct, query: "B09H74FXNW" }` |
| `Target.AmazonSearch` | Amazon search results | `{ target: Target.AmazonSearch, query: "laptop" }` |
| `Target.AmazonPricing` | Amazon pricing and offers | `{ target: Target.AmazonPricing, query: "B09H74FXNW" }` |
| `Target.WalmartProduct` | Walmart product page by product ID | `{ target: Target.WalmartProduct, product_id: "15296401808" }` |
| `Target.TargetProduct` | Target.com product page by product ID | `{ target: Target.TargetProduct, product_id: "92186007" }` |
| `Target.Ecommerce` | Generic eCommerce page with parser | `{ target: Target.Ecommerce, url: "https://example.com/product/123" }` |

### Social media

| Target | Description | Example |
| --- | --- | --- |
| `Target.RedditPost` | Reddit post by URL | `{ target: Target.RedditPost, url: "https://reddit.com/r/nba/..." }` |
| `Target.RedditSubreddit` | Reddit subreddit by URL | `{ target: Target.RedditSubreddit, url: "https://reddit.com/r/nba/" }` |
| `Target.YoutubeVideo` | YouTube video by ID | `{ target: Target.YoutubeVideo, query: "dFu9aKJoqGg" }` |
| `Target.YoutubeSearch` | YouTube search results | `{ target: Target.YoutubeSearch, query: "ambient music" }` |
| `Target.TiktokPost` | TikTok post by URL | `{ target: Target.TiktokPost, url: "https://www.tiktok.com/@nba/video/..." }` |

### AI tools

| Target | Description | Example |
| --- | --- | --- |
| `Target.Chatgpt` | ChatGPT response for a prompt | `{ target: Target.Chatgpt, prompt: "What are the top three dog breeds?" }` |
| `Target.Perplexity` | Perplexity response for a prompt | `{ target: Target.Perplexity, prompt: "What causes seasonal allergies?" }` |
| `Target.Gemini` | Gemini response for a prompt | `{ target: Target.Gemini, prompt: "What are the top three dog breeds?" }` |
| `Target.GoogleAiMode` | Google AI Mode response | `{ target: Target.GoogleAiMode, query: "What are the top three dog breeds?" }` |

### Universal scraping

| Target | Description | Example |
| --- | --- | --- |
| `Target.Universal` | Any URL via the universal scraper | `{ target: Target.Universal, url: "https://example.com" }` |
| `Target.Google` | Raw Google URL scraping | `{ target: Target.Google, url: "https://google.com/search?q=laptop" }` |
| `Target.Amazon` | Raw Amazon URL scraping | `{ target: Target.Amazon, url: "https://amazon.com/dp/B09H74FXNW" }` |

> `Target.UniversalEcommerce` isn't listed above because it doesn't accept a primary input parameter like `url`, `query`, `product_id`, or `prompt`. It only accepts optional configuration fields such as `callback_url`.

For the full target list and parameter details, see the API documentation:

- [Target list](https://help.decodo.com/docs/web-scraping-api-targets)
- [Parameters](https://help.decodo.com/docs/web-scraping-api-parameters)

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

## Get started

Build scraping workflows with the Decodo Web Scraping API:

- [Start free plan](https://dashboard.decodo.com/)
- [Documentation](https://help.decodo.com/docs/introduction)
- [Discord](https://discord.gg/Ja8dqKgvbZ)

## License

Released under the [MIT License](https://github.com/Decodo/Decodo/blob/master/LICENSE).
