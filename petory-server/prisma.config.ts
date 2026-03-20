import { resolve } from 'node:path';
import dotenv from 'dotenv';
import { defineConfig } from 'prisma/config';

const envFile =
  process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.dev';

dotenv.config({
  path: resolve(process.cwd(), envFile),
});

export default defineConfig({
  schema: resolve(process.cwd(), 'prisma'),
  migrations: {
    path: resolve(process.cwd(), 'prisma', 'migrations'),
  },
  datasource: {
    url: process.env.DATABASE_URL ?? '',
  },
});
