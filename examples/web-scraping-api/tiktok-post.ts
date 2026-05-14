import { DecodoClient, Target } from '@decodo/sdk-ts';

const client = new DecodoClient({
  webScrapingApi: {
    token: '<web_auth_token>',
  },
});

const res = await client.webScrapingApi.scrape({
  target: Target.TiktokPost,
  url: 'https://www.tiktok.com/@nba/video/7255379108241198378',
});

console.log(JSON.stringify(res, null, 2));
