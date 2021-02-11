import 'dotenv/config';

import { TypeOrmModuleOptions } from '@nestjs/typeorm/dist/interfaces/typeorm-options.interface';

import { isProduction } from './environment';
import { booleanEnv } from './tools';

const baseDir = isProduction ? 'dist' : 'src';

console.error(
  `TypeORM configuration uses base directory '${baseDir}' in ${__filename}`,
);

export const ormConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.TYPEORM_HOST,
  port: +process.env.TYPEORM_PORT,
  username: process.env.TYPEORM_USERNAME,
  password: process.env.TYPEORM_PASSWORD,
  database: process.env.TYPEORM_DATABASE,
  entities: [`${baseDir}/database/entities/**/*.entity{.ts,.js}`],
  migrationsTableName: 'typeorm_migrations',
  migrations: [`${baseDir}/database/migrations/*{.ts,.js}`],
  cli: {
    migrationsDir: `${baseDir}/database/migrations`,
  },
  logging: booleanEnv(process.env.DEBUG_SQL),
};

// для того, чтобы работал скрипт build:diagram
export default ormConfig;
