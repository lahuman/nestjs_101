import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity()
@Unique(["id"])
@Unique(["email"])
export class UserEntity extends BaseEntity {
  constructor(partial: Partial<UserEntity>) {
    super(partial);
  }

  @PrimaryGeneratedColumn()
  seq: number;

  @ApiProperty({ description: 'user Id', required: true })
  @Column()
  id: string;

  @ApiProperty({ description: 'user name', required: true })
  @Column()
  name: string;

  @ApiProperty({ description: 'user Email', required: true })
  @IsEmail()
  @Column()
  email: string;

  @ApiProperty({ description: 'user password', required: true })
  @IsNotEmpty()
  @Exclude()
  @Column()
  password: string;
}
