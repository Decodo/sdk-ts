import { DecodoClient, Target } from '@decodo/sdk-ts';

const client = new DecodoClient({
  webScrapingApi: {
    token: '<web_auth_token>',
  },
});

const res = await client.webScrapingApi.scrape({
  target: Target.YoutubeSubtitles,
  query: 'L8zSWbQN-v8',
});

console.log(JSON.stringify(res, null, 2));
