import { DecodoClient, Target } from '@decodo/sdk-ts';

const client = new DecodoClient({
  webScrapingApi: {
    token: '<web_auth_token>',
  },
});

const res = await client.webScrapingApi.scrape({
  target: Target.Bbb,
  url: 'https://www.bbb.org/search?find_text=Tree+Service&find_entity=&find_type=&find_loc=New+York%2C+NY&find_country=USA',
});

console.log(JSON.stringify(res, null, 2));
