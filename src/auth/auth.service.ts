// auth.service.ts
import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserEntity } from 'src/entity/user.entity';
import { CreateUserDto, LoginUserDto, UserRO } from 'src/user/dto/user.dto';
import { UserService } from '../user/user.service';
import { compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RegistrationStatus } from './interfaces/regisration-status.interface';
import { LoginStatus } from './interfaces/login-status.interface';
import { JwtPayload } from './interfaces/payload.interface';
import { UserDto } from '../dto/user.dto';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UserService, private readonly jwtService: JwtService) { }

  async register(userDto: CreateUserDto): Promise<RegistrationStatus> {
    let status: RegistrationStatus = {
      success: true,
      message: 'user registered',
    };

    try {
      await this.usersService.save(userDto, userDto.id);
    } catch (err) {
      status = {
        success: false,
        message: err,
      };
    }

    return status;
  }

  async login(loginUserDto: LoginUserDto): Promise<LoginStatus> {
    const { id, password } = loginUserDto;
    // find user in db
    const { user } = await this.usersService.findUser(id);

    if (user && password === user.password) {

      // generate and sign token
      const token = this._createToken(user);

      return {
        id: user.id,
        ...token,
      };
    }

    throw new UnauthorizedException("Does not has user");

  }

  async validateUser({ id }: JwtPayload): Promise<UserRO> {
    const user = await this.usersService.findUser(id);
    if (!user) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    return user;
  }

  private _createToken({ id }: UserDto): any {
    const expiresIn = process.env.EXPIRESIN;

    const user: JwtPayload = { id };
    const accessToken = this.jwtService.sign(user);
    return {
      expiresIn,
      accessToken,
    };
  }
}