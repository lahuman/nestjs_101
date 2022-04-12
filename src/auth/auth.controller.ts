import {
  Controller,
  Body,
  Post,
  HttpException,
  HttpStatus,
  UsePipes,
  Get,
  Req,
  UseGuards,
  UseFilters,
} from '@nestjs/common';
import { CreateUserDto } from '../user/dto/user.dto';
import { RegistrationStatus } from './interfaces/regisration-status.interface';
import { AuthService } from './auth.service';
import { LoginStatus } from './interfaces/login-status.interface';
import { LoginUserDto } from '../user/dto/user.dto';
import { JwtPayload } from './interfaces/payload.interface';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthExceptionFilter } from '../common/filters/auth-exceptions.filter';
import { JwtGuard } from '../common/guards/jwt.guard';

@ApiTags('계정관리')
@Controller('auth')
@UseFilters(AuthExceptionFilter)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  public async login(@Body() loginUserDto: LoginUserDto): Promise<LoginStatus> {
    return await this.authService.login(loginUserDto);
  }

  @Get('whoami')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  public async testAuth(@Req() req: any): Promise<JwtPayload> {
    return req.user;
  }
}
