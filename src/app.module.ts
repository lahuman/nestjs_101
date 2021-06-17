import { HttpModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';


@Module({
  imports: [ConfigModule.forRoot(), HttpModule,
  TypeOrmModule.forRoot({
    type: "sqlite",
    database: ":memory:",
    dropSchema: true,
    entities: ["dist/**/*.entity{.ts,.js}"],
    synchronize: true,
    logging: true
  }),
  UserModule,
  AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
