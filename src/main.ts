import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import flash = require('connect-flash');
import * as session from 'express-session';
import helmet from 'helmet';
import * as passport from 'passport';
import rateLimit from 'express-rate-limit'
import { Logger } from 'nestjs-pino';

import { AppModule } from './app.module';

async function bootstrap() {

  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  // @UseInterceptors(ClassSerializerInterceptor) 을 Global로 처리
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true })); 
  app.useLogger(app.get(Logger));
  app.flushLogs();

  app.use(helmet());
  app.enableCors();
  const config = new DocumentBuilder()
    .setTitle('User example')
    .setDescription('The user API description')
    .setVersion('1.0').addTag('user')
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

  app.use(
    session({
      secret: 'my-secret',
      resave: false,
      saveUninitialized: false,
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());
  app.use(flash());

  await app.listen(3000);
}
bootstrap();
