import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import flash = require('connect-flash');
import * as session from 'express-session';
import * as helmet from 'helmet';
import * as passport from 'passport';
import { AppModule } from './app.module';
import rateLimit from 'express-rate-limit'
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import * as path from 'path';

async function bootstrap() {

  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
      transports: [
        new winston.transports.Console(),
        new (require('winston-daily-rotate-file'))({
          dirname: path.join(__dirname, './../logs/debug/'), // 파일 저장 위치
          filename: 'debug-%DATE%.log', // 파일 명
          datePattern: 'YYYY-MM-DD-HH', // 파일명의 날짜(DATE) 패턴
          level: 'debug', // 로그 레벨
          zippedArchive: true, //압축 여부
          maxSize: '20m', // 한개의 파일 최대 크기
          maxFiles: '14d' // 파일의 최대 유지 날짜
        }),
        new (require('winston-daily-rotate-file'))({
          dirname: path.join(__dirname, './../logs/info/'),
          filename: 'info-%DATE%.log',
          datePattern: 'YYYY-MM-DD-HH',
          level: 'info',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d'
        }),
      ],
    })
  });
  app.useGlobalPipes(new ValidationPipe());

  app.use(helmet());
  app.enableCors();
  const config = new DocumentBuilder()
    .setTitle('User example')
    .setDescription('The user API description')
    .setVersion('1.0').addTag('user')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'Token' },
      'Authorization',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
  
  /**
   * To protect your applications from brute-force attacks
   */
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
    }),
  );


  await app.listen(3000);
}
bootstrap();
