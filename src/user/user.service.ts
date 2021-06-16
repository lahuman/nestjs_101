import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from 'src/dto/user.dto';
import { Repository } from 'typeorm';
import { UserEntity } from '../entity/user.entity';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity)
        private usersRepository: Repository<UserEntity>,
    ) { }

    findAll(): Promise<UserEntity[]> {
        return this.usersRepository.find();
    }

    findOne(id: string): Promise<UserEntity> {
        return this.usersRepository.findOne(id);
    }

    async remove(id: string): Promise<void> {
        await this.usersRepository.delete(id);
    }

    async save(userInfo: CreateUserDto): Promise<UserEntity> {
        return await this.usersRepository.save(new UserEntity(userInfo.user));
    }
}
