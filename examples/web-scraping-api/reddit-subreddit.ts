import { DecodoClient, Target } from '@decodo/sdk-ts';

const client = new DecodoClient({
  webScrapingApi: {
    token: '<web_auth_token>',
  },
});

const res = await client.webScrapingApi.scrape({
  target: Target.RedditSubreddit,
  url: 'https://www.reddit.com/r/nba/',
});

console.log(JSON.stringify(res, null, 2));
