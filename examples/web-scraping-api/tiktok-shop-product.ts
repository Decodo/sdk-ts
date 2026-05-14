import { DecodoClient, Target } from '@decodo/sdk-ts';

const client = new DecodoClient({
  webScrapingApi: {
    token: '<web_auth_token>',
  },
});

const res = await client.webScrapingApi.scrape({
  target: Target.TiktokShopProduct,
  product_id: '1731541214379741272',
  headless: 'html',
});

console.log(JSON.stringify(res, null, 2));
