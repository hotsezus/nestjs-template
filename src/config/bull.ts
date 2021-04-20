export const bullConfig = {
  redis: {
    host: process.env.REDIS_HOST,
    port: +process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
  },
};

export enum Queues {
  test = 'test',
}
