import { QueryLogger } from "../core/query.logger";

const SnakeNamingStrategy =
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('./../core/snake-naming.strategy').SnakeNamingStrategy;


export default () => ({
  databaseConfig: {
    type: 'sqlite',
    namingStrategy: new SnakeNamingStrategy(),
    host: process.env.DB_HOST,
    port: +process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_SCHEMA,
    entities: [`${process.env.NODE_ENV === 'test'?'src':'dist'}/**/*.entity.{ts,js}`],
    dropSchema: process.env.DB_DROP === 'true',
    synchronize: process.env.DB_SYNC === 'true',
    logging: process.env.DB_LOGGING === 'true',
    logger: new QueryLogger(),
    maxQueryExecutionTime: 1000, // 1초 이상되는 모든 쿼리 등록
  },
});
