import { Body, Controller, Get, Logger, Post, Req, Res, UseFilters, UseGuards,  } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AppService } from './app.service';
import { LoginDto, UserDto } from './dto/user.dto';
import { Request, Response } from 'express';
import { AllExceptionsFilter } from './common/filters/auth-exceptions.filter';
import { LoginGuard } from './common/guards/login.guard';
import { ApiBody } from '@nestjs/swagger';
import { AuthenticatedGuard } from './common/guards/authenticated.guard';
import { ThrottlerBehindProxyGuard } from './common/core/throttler.guard';
import { Throttle } from '@nestjs/throttler';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService,
    private configService: ConfigService,
    private httpService: HttpService) { }
  private readonly logger = new Logger(AppController.name);

  @Get()
  getHello(): string {
    this.logger.debug("HELLO WORLD");
    return this.appService.getHello();
  }

  @Post('valid')
  @UseGuards(ThrottlerBehindProxyGuard)
  @Throttle(3, 60)
  testValid(@Body() userDto: UserDto) {
    this.logger.log(userDto);
    // get an environment variable
    const dbUser = this.configService.get<string>('DATABASE_USER');

    // get a custom configuration value
    const dbHost = this.configService.get<string>('DATABASE_PASSWORD');
    return "pass valid! : " + dbUser + "/" + dbHost;
  }

  @Get('visits')
  findAll(@Req() req: Request): string {
    req.session["visits"] = req.session["visits"] ? req.session["visits"] + 1 : 1;
    return "My VISITS : " + req.session["visits"];
  }

  @Get('/httpTest')
  async callMockHtt(): Promise<any> {
    const res = await firstValueFrom(this.httpService.get('http://jsonplaceholder.typicode.com/todos/1'));
    return res.data;
  }

  @UseGuards(LoginGuard)
  @ApiBody({ type: LoginDto })
  @Post('/login')
  login(@Req() req, @Res() res: Response): void {
    res.send(req.user);
  }

  @UseGuards(AuthenticatedGuard)
  @Get('/loginCheck')
  loginCheck(@Req() req, @Res() res: Response): void {
    res.send(req.user);
  }

  @Get('/logout')
  logout(@Req() req, @Res() res: Response): void {
    req.logout();
    res.redirect('/');
  }
}
