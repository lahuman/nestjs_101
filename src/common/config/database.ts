import { QueryLogger } from "../core/query.logger";

const SnakeNamingStrategy =
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('./../core/snake-naming.strategy').SnakeNamingStrategy;


export default () => ({
  databaseConfig: {
    type: 'mysql',
    namingStrategy: new SnakeNamingStrategy(),
    host: process.env.DB_MYSQL_HOST,
    port: +process.env.DB_MYSQL_PORT,
    username: process.env.DB_MYSQL_USERNAME,
    password: process.env.DB_MYSQL_PASSWORD,
    database: process.env.DB_MYSQL_DB_SCHEMA,
    entities: [`${process.env.NODE_ENV === 'test'?'src':'dist'}/**/*.entity.{ts,js}`],
    dropSchema: process.env.DB_DROP === 'true',
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
    logging: process.env.DB_LOGGING === 'true',
    logger: new QueryLogger(),
    maxQueryExecutionTime: 1000, // 1초 이상되는 모든 쿼리 등록
  },
  databaseRoConfig: {
    name: 'Read',
    host: process.env.DB_MYSQL_RO_HOST,
    type: 'mysql',
    namingStrategy: new SnakeNamingStrategy(),
    port: +process.env.DB_MYSQL_RO_PORT,
    username: process.env.DB_MYSQL_USERNAME,
    password: process.env.DB_MYSQL_PASSWORD,
    database: process.env.DB_MYSQL_DB_SCHEMA,
    entities: [`${process.env.NODE_ENV === 'test'?'src':'dist'}/**/*.entity.{ts,js}`],
    dropSchema: process.env.DB_DROP === 'true',
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
    logging: process.env.DB_LOGGING === 'true',
    logger: new QueryLogger(),
    maxQueryExecutionTime: 1000, // 1초 이상되는 모든 쿼리 등록
  },
});
