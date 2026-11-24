import { generateDataApiFile } from './data-api/generate-data-api';
import { generateFlowsFile } from './flows/generate-flows';
import { generateParameterSchemasFile } from './web-scraping-api/generate-parameter-schemas';
import { generateParametersFile } from './web-scraping-api/generate-parameters';
import { generateTargetsFile } from './web-scraping-api/generate-targets';

const main = async () => {
  await Promise.all([
    generateParametersFile(),
    generateTargetsFile(),
    generateParameterSchemasFile(),
    generateDataApiFile(),
    generateFlowsFile(),
  ]);
};

main();

export {};
