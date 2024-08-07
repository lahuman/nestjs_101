import {
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { AppLoggerMiddleware } from './common/middleware/AppLoggerMiddleware';
import logging from './common/config/pinoLogging';
import databaseConfig from './common/config/database';
import { HttpCacheInterceptor } from './common/core/httpcache.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { FirebaseModule } from './common/firebase/firebase.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env'],
      isGlobal: true,
      load: [logging, databaseConfig],
    }),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.get('logginConfig'),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.get('databaseConfig'),
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: 1000*10
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
    FirebaseModule,
    UserModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService,   {
    // cacheFilter 등록
    provide: APP_INTERCEPTOR,
    useClass: HttpCacheInterceptor,
  },],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    // consumer.apply(AppLoggerMiddleware).forRoutes('*'); // pino 로그 사용시, 기본적인 요청에 의한 로깅이 생성됨으로 삭제 처리
  }
}
