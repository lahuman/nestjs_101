import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class UserDto {
  constructor(partial: Partial<UserDto>) {
    Object.assign(this, partial);
  }
  @ApiProperty({ description: 'user id', required: true })
  id: string;

  @ApiProperty({ description: 'user password', required: true })
  @IsNotEmpty()
  password: string;
}
export class LoginDto {
  constructor(partial: Partial<UserDto>) {
    Object.assign(this, partial);
  }
  @ApiProperty({ description: 'user id', required: true })
  id: string;

  @ApiProperty({ description: 'user password', required: true })
  password: string;
}
