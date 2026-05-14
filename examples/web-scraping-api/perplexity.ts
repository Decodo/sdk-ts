import { DecodoClient, Target } from '@decodo/sdk-ts';

const client = new DecodoClient({
  webScrapingApi: {
    token: '<web_auth_token>',
  },
});

const res = await client.webScrapingApi.scrape({
  target: Target.Perplexity,
  prompt: 'What are the main causes of seasonal allergies?',
  parse: true,
  geo: 'United States',
});

console.log(JSON.stringify(res, null, 2));
