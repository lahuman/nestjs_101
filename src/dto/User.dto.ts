import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class UserDto {
  @IsEmail()
  @ApiProperty({description: "user Id by Email", required: true})
  email: string;

  @IsNotEmpty()
  @ApiProperty({description: "user password", required: true})
  password: string;
}