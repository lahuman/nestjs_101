import { Body, Controller, Get, HttpService, Logger, Post, Req } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppService } from './app.service';
import { UserDto } from './dto/User.dto';
import { Request } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService,
    private configService: ConfigService,
    private httpService: HttpService) { }
  private readonly logger = new Logger(AppController.name);

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('valid')
  testValid(@Body() userDto: UserDto) {
    this.logger.log(userDto);
    // get an environment variable
    const dbUser = this.configService.get<string>('DATABASE_USER');

    // get a custom configuration value
    const dbHost = this.configService.get<string>('DATABASE_PASSWORD');
    return "pass valid! : " + dbUser + "/" + dbHost;
  }

  @Get('/visits')
  findAll(@Req() req: Request): string {
    req.session["visits"] = req.session["visits"] ? req.session["visits"] + 1 : 1;
    return "My VISITS : " + req.session["visits"];
  }

  @Get('/httpTest')
  async callMockHtt(): Promise<any> {
    const res = await this.httpService.get('http://jsonplaceholder.typicode.com/todos/1').toPromise();
    return res.data;
  }
}
