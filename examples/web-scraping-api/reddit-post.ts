import { DecodoClient, Target } from '@decodo/sdk-ts';

const client = new DecodoClient({
  webScrapingApi: {
    token: '<web_auth_token>',
  },
});

const res = await client.webScrapingApi.scrape({
  target: Target.RedditPost,
  url: 'https://www.reddit.com/r/nba/comments/17jrqc5/serious_next_day_thread_postgame_discussion/',
});

console.log(JSON.stringify(res, null, 2));
