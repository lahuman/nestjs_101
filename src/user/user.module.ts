import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AllExceptionsFilter } from 'src/common/filters/auth-exceptions.filter';
import { UserEntity } from '../entity/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([
    UserEntity,
  ]),],
  controllers: [UserController],
  providers: [UserService,
    {
      // ExceptionFilter 등록
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },],
  exports: [UserService],


})
export class UserModule { }
