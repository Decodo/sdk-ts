import { DecodoClient, Target } from '@decodo/sdk-ts';

const client = new DecodoClient({
  webScrapingApi: {
    token: '<web_api_token>',
  },
});

const res = await client.webScrapingApi.scrape({
  target: Target.YoutubeSubtitles,
  query: '1234567890',
  language_code: 'en',
  subtitle_origin: 'youtube',
});

const firstResult = res.results[0];
console.log(JSON.stringify(firstResult.content, null, 2));
