import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto, ModifyUserDto, SearchUserDto, UserRO } from './dto/user.dto';
import { Like, Repository } from 'typeorm';
import { UserEntity } from '../entity/user.entity';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity)
        private usersRepository: Repository<UserEntity>,
    ) { }

    async find(searchUser: SearchUserDto): Promise<UserRO> {
        const condition = {};
        searchUser.id && (condition['id'] = Like(`%${searchUser.id}%`));
        searchUser.name && (condition['name'] = Like(`%${searchUser.name}%`));
        const list = await this.usersRepository.find({ ...condition });
        return new UserRO({ list });
    }

    async findUser(id: string): Promise<UserRO> {
        const user = await this.usersRepository.findOne({ id });
        return new UserRO({ user });
    }

    async remove(id: string): Promise<void> {
        await this.usersRepository.softDelete({ id });
    }

    async save(userInfo: CreateUserDto): Promise<UserRO> {
        const user = await this.usersRepository.save(new UserEntity(userInfo));
        return new UserRO({ user });
    }
    async update(id: string, userInfo: ModifyUserDto): Promise<UserRO> {
        const user = await this.usersRepository.findOne({ id });
        const reUser = await this.usersRepository.save(new UserEntity({ ...user, ...userInfo }));
        return new UserRO({ user: reUser });
    }
}
