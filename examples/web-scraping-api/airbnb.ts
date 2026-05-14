import { DecodoClient, Target } from '@decodo/sdk-ts';

const client = new DecodoClient({
  webScrapingApi: {
    token: '<web_auth_token>',
  },
});

const res = await client.webScrapingApi.scrape({
  target: Target.Airbnb,
  url: 'https://www.airbnb.com/s/New-York-City--New-York--United-States/homes?refinement_paths%5B%5D=%2Fhomes&place_id=ChIJOwg_06VPwokRYv534QaPC8g&location_bb=QiOru8KTZn1CIegEwpSEhw%3D%3D&acp_id=6333bccb-ed88-460f-950a-ed9788913f4d&date_picker_type=calendar&search_type=autocomplete_click',
});

console.log(JSON.stringify(res, null, 2));
