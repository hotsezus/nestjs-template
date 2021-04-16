import 'dotenv/config';

import { TypeOrmModuleOptions } from '@nestjs/typeorm/dist/interfaces/typeorm-options.interface';

import { typeormBaseDirectory } from './environment';
import { booleanEnv } from './tools';

console.error(
  `TypeORM configuration uses base directory '${typeormBaseDirectory}' in ${__filename}`,
);

export const ormConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.TYPEORM_HOST,
  port: +process.env.TYPEORM_PORT,
  username: process.env.TYPEORM_USERNAME,
  password: process.env.TYPEORM_PASSWORD,
  database: process.env.TYPEORM_DATABASE,
  entities: [`${typeormBaseDirectory}/database/entities/**/*.entity{.ts,.js}`],
  migrationsTableName: 'typeorm_migrations',
  migrations: [`${typeormBaseDirectory}/database/migrations/*{.ts,.js}`],
  cli: {
    migrationsDir: `${typeormBaseDirectory}/database/migrations`,
  },
  logging: booleanEnv(process.env.DEBUG_SQL),
};

// для того, чтобы работал скрипт build:diagram
export default ormConfig;
