import { resolve } from 'node:path';

const DEVELOPMENT_ENV_FILE = '.env.dev';
const PRODUCTION_ENV_FILE = '.env.prod';

export function resolveEnvFilePath(): string {
  const filename =
    process.env.NODE_ENV === 'production'
      ? PRODUCTION_ENV_FILE
      : DEVELOPMENT_ENV_FILE;

  return resolve(process.cwd(), filename);
}
