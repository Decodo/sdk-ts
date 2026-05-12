import { generateParametersFile } from './web-scraping-api/generate-parameters';
import { generateTargetsFile } from './web-scraping-api/generate-targets';

const main = async () => {
  generateParametersFile();
  generateTargetsFile();
};

main();

export {};
