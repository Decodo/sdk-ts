import { DecodoClient, Target, type ScrapeRequest } from '@decodo/sdk-ts';

const client = new DecodoClient({
  webScrapingApi: {
    token: '<web_api_token>',
  },
});

const req: ScrapeRequest = {
  target: Target.YoutubeSubtitles,
  query: '1234567890',
  language_code: 'en',
  subtitle_origin: 'youtube',
};

const res = await client.webScrapingApi.scrape(req);

const firstResult = res.results[0];
console.log('status_code:', firstResult?.status_code);
console.log('task_id:', firstResult?.task_id);
console.log('content (preview):', firstResult.content);
