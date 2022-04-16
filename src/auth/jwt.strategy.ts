import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { JwtPayload } from './interfaces/payload.interface';
import { UserRO } from '../user/dto/user.dto';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService, private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // token을 validate에서 직접 처리 하려면 true로 변경 해야 한다.
      secretOrKey: configService.get('SECRETKEY'),
    });
  }

  async validate(payload: JwtPayload): Promise<UserRO> {
    const user = await this.authService.validateUser(payload);
    if (!user.user) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    return user;
  }
}