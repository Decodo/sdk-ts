import { generateDataApiFile } from './data-api/generate-data-api';
import { generateParameterSchemasFile } from './web-scraping-api/generate-parameter-schemas';
import { generateParametersFile } from './web-scraping-api/generate-parameters';
import { generateTargetsFile } from './web-scraping-api/generate-targets';

const main = async () => {
  await Promise.all([
    generateParametersFile(),
    generateTargetsFile(),
    generateParameterSchemasFile(),
    generateDataApiFile(),
  ]);
};

main();

export {};
