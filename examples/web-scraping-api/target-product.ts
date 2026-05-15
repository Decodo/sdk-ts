import { DecodoClient, Target } from '@decodo/sdk-ts';

const client = new DecodoClient({
  webScrapingApi: {
    token: '<web_auth_token>',
  },
});

const res = await client.webScrapingApi.scrape({
  target: Target.TargetProduct,
  product_id: '92186007',
  headless: 'html',
  parse: true,
});

console.log(JSON.stringify(res, null, 2));
