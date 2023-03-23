import * as dotenv from 'dotenv';
import * as path from 'path';

import pgConfig from '../config/pg.config';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const postgreConfig = pgConfig().pg;

export = {
  type: postgreConfig.type,
  host: postgreConfig.host,
  port: postgreConfig.port,
  username: postgreConfig.username,
  password: postgreConfig.password,
  database: postgreConfig.database,
  synchronize: postgreConfig.synchronize,
  logging: postgreConfig.logging,
  entities: postgreConfig.entities,
  migrations: postgreConfig.migrations,
  cli: {
    migrationsDir: './src/infrastructure/db/migrations',
  },
};
