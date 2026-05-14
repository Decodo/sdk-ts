import { DecodoClient, Target } from '@decodo/sdk-ts';

const client = new DecodoClient({
  webScrapingApi: {
    token: '<web_auth_token>',
  },
});

const res = await client.webScrapingApi.scrape({
  target: Target.YoutubeSearch,
  query: 'How to care for chinchillas',
});

console.log(JSON.stringify(res, null, 2));
