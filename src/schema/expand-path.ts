import { homedir } from 'node:os';
import { resolve } from 'node:path';

export const expandPath = (path: string): string => {
  if (path.startsWith('~/')) {
    return resolve(homedir(), path.slice(2));
  }
  if (path === '~') {
    return homedir();
  }
  return resolve(path);
};
