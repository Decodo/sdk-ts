import { DecodoClient, Target } from '@decodo/sdk-ts';

const client = new DecodoClient({
  webScrapingApi: {
    token: '<web_auth_token>',
  },
});

const res = await client.webScrapingApi.scrape({
  target: Target.Chatgpt,
  prompt: 'What are the top three dog breeds?',
  parse: true,
});

console.log(JSON.stringify(res, null, 2));
