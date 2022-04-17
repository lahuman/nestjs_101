// auth.service.ts
import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UserService) { }

  async validateUser(id: string, password: string): Promise<any> {
    const { user } = await this.usersService.findUser(id);
    if (user && user.password === password) {
      const { password, deletedAt, ...result } = user;
      return result;
    }
    return null;
  }
}