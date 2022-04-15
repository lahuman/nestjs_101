import {
  HttpModule,
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import * as Transport from 'winston-transport';
import * as winston from 'winston';
import * as path from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { AppLoggerMiddleware } from './common/middleware/AppLoggerMiddleware';

@Module({
  imports: [
    ConfigModule.forRoot(),
    HttpModule,
    WinstonModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const transports: [Transport] = [
          new (require('winston-daily-rotate-file'))({
            dirname: path.join(
              __dirname,
              configService.get('LOGGING_PATH'),
              '/info/',
            ),
            filename: 'info-%DATE%.log',
            datePattern: 'YYYY-MM-DD-HH',
            level: 'info',
            zippedArchive: configService.get('LOGGING_ZIP') === 'true',
            maxSize: configService.get('LOGGING_MAXSIZE'),
            maxFiles: configService.get('LOGGING_MAXFILES'),
          }),
        ];

        // LOGGING_DEBUG 가 true 일 경우만 추가
        if (configService.get('LOGGING_DEBUG') === 'true') {
          transports.push(
            new (require('winston-daily-rotate-file'))({
              dirname: path.join(
                __dirname,
                configService.get('LOGGING_PATH'),
                '/debug/',
              ), // 파일 저장 위치
              filename: 'debug-%DATE%.log', // 파일 명
              datePattern: 'YYYY-MM-DD-HH', // 파일명의 날짜(DATE) 패턴
              level: 'debug', // 로그 레벨
              zippedArchive: configService.get('LOGGING_ZIP') === 'true', //압축 여부
              maxSize: configService.get('LOGGING_MAXSIZE'), // 한개의 파일 최대 크기
              maxFiles: configService.get('LOGGING_MAXFILES'), // 파일의 최대 유지 날짜
            }),
          );
        }

        return {
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
          transports: [
            new winston.transports.Console({
              level: configService.get('LOGGING_CONSOLE_LEVEL'),
            }),
            ...transports,
          ],
        };
      },
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'sqlite',
        database: configService.get('DB_HOST'),
        dropSchema: configService.get('DB_DROP') === 'true',
        entities: ['dist/**/*.entity{.ts,.js}'],
        synchronize: configService.get('DB_SYNC') === 'true',
        logging: configService.get('DB_LOGGING') === 'true',
        logger: configService.get('LOGGING_WAY') ,
      }),
    }),
    UserModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AppLoggerMiddleware).forRoutes('*');
  }
}
