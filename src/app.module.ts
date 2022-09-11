import {
  CacheModule,
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { AppLoggerMiddleware } from './common/middleware/AppLoggerMiddleware';
import logging from './common/config/logging';
import databaseConfig from './common/config/database';
import { HttpCacheInterceptor } from './common/core/httpcache.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';

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
    WinstonModule.forRootAsync({
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
      ttl: 60 * 60
    }),
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
    consumer.apply(AppLoggerMiddleware).forRoutes('*');
  }
}
