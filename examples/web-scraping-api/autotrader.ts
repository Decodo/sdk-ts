import { DecodoClient, Target } from '@decodo/sdk-ts';

const client = new DecodoClient({
  webScrapingApi: {
    token: '<web_auth_token>',
  },
});

const res = await client.webScrapingApi.scrape({
  target: Target.Autotrader,
  url: 'https://www.autotrader.co.uk/car-search?channel=cars&postcode=SE15+6GY&make=',
});

console.log(JSON.stringify(res, null, 2));
