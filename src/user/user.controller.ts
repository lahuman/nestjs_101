import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBasicAuth, ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../common/guards/jwt.guard';
import { AuthExceptionFilter } from '../common/filters/auth-exceptions.filter';
import { AuthenticatedGuard } from '../common/guards/authenticated.guard';
import { CreateUserDto, ModifyUserDto, SearchUserDto, UserRO } from './dto/user.dto';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('사용자')
@ApiBasicAuth()
@Controller('user')
@UseFilters(AuthExceptionFilter)
export class UserController {
  constructor(private readonly service: UserService) { }

  @ApiOperation({ summary: '사용자 추가 (로그인 없이 추가)' })
  @ApiResponse({ status: 200, type: UserRO })
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiBody({ type: CreateUserDto })
  @Post("addTestUser")
  async addTestUser(@Body() userDto: CreateUserDto): Promise<UserRO> {
    return this.service.save(userDto, 'test');
  }

  @ApiOperation({ summary: '사용자 조회' })
  @ApiResponse({ status: 200, type: UserRO })
  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Get()
  async find(@Query() searchUser: SearchUserDto): Promise<UserRO> {
    return this.service.find(searchUser);
  }

  @ApiOperation({ summary: '사용자 목록 조회' })
  @ApiResponse({ status: 200, type: UserRO })
  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Get(':id')
  async findUser(@Param("id") id: string): Promise<UserRO> {
    return this.service.findUser(id);
  }

  @ApiBody({ type: CreateUserDto })
  @ApiOperation({ summary: '사용자 등록' })
  @ApiResponse({ status: 201, type: UserRO })
  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Post()
  async addUser(@Req() req, @Body() userDto: CreateUserDto): Promise<UserRO> {
    return await this.service.save(userDto, req.user.id);
  }

  @ApiBody({ type: ModifyUserDto })
  @ApiOperation({ summary: '사용자 수정' })
  @ApiResponse({ status: 200, type: UserRO })
  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Put(':id')
  async modifyUser(@Param("id") id: string, @Body() userDto: ModifyUserDto): Promise<UserRO> {
    return await this.service.update(id, userDto);
  }

  @ApiOperation({ summary: '사용자 삭제' })
  @ApiResponse({ status: 200, })
  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Delete(':id')
  async deleteUser(@Param("id") id: string,): Promise<void> {
    await this.service.remove(id);
  }
}
