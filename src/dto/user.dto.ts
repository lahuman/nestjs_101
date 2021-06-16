import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { UserEntity } from 'src/entity/user.entity';

export class CreateUserDto {
    user: UserEntity;
    constructor(partial: Partial<CreateUserDto>) {
        Object.assign(this, partial);
    }
}

export class UserDto {
    @ApiProperty({ description: "user Email", required: true })
    @IsEmail()
    email: string;

    @ApiProperty({ description: "user password", required: true })
    @IsNotEmpty()
    password: string;
    constructor(partial: Partial<UserDto>) {
        Object.assign(this, partial);
    }
}