import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { UserEntity } from '../../entity/user.entity';

export class UserRO {
  constructor(partial: Partial<UserRO>) {
    Object.assign(this, partial);
  }

  @ApiProperty({ required: false, type: UserRO })
  user?: UserEntity;
  @ApiProperty({ required: false, isArray: true, type: UserRO })
  list?: UserEntity[];
}

export class SearchUserDto {
  @ApiProperty({ description: 'user Id', required: false })
  id?: string;

  @ApiProperty({ description: 'user name', required: false })
  name?: string;
}

export class LoginUserDto {
  @ApiProperty({ description: 'user Id', required: true })
  @IsNotEmpty()
  readonly id: string;

  @ApiProperty({ description: 'user password', required: true })
  @IsNotEmpty()
  readonly password: string;
}

export class CreateUserDto {
  @ApiProperty({ description: 'user Id', required: true })
  @IsNotEmpty()
  id: string;

  @ApiProperty({ description: 'user name', required: true })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'user Email', required: true })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'user password', required: true })
  @IsNotEmpty()
  password: string;
}

export class ModifyUserDto {

  @ApiProperty({ description: 'user name', required: false })
  name?: string;

  @ApiProperty({ description: 'user password', required: false })
  @IsNotEmpty()
  password?: string;
}
