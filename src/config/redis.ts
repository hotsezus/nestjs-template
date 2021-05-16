import { tryNumber } from '@proscom/ui-utils';

export const redis = {
  host: process.env.REDIS_HOST,
  port: tryNumber(process.env.REDIS_PORT, 6379),
  password: process.env.REDIS_PASSWORD,
};
