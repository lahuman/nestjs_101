import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import flash = require('connect-flash');
import * as session from 'express-session';
import * as helmet from 'helmet';
import * as passport from 'passport';
import { AppModule } from './app.module';
import rateLimit from 'express-rate-limit'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'debug', 'error']
  });
  app.useGlobalPipes(new ValidationPipe());
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
