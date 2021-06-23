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
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthExceptionFilter } from '../common/filters/auth-exceptions.filter';
import { AuthenticatedGuard } from '../common/guards/authenticated.guard';
import { CreateUserDto, ModifyUserDto, SearchUserDto, UserRO } from './dto/user.dto';
import { UserService } from './user.service';

@Controller('user')
@ApiTags('사용자')
@UseFilters(AuthExceptionFilter)
export class UserController {
  constructor(private readonly service: UserService) { }

  @ApiOperation({ summary: '사용자 목록 조회' })
  @ApiResponse({ status: 200, type: UserRO })
  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  async find(@Query() searchUser: SearchUserDto): Promise<UserRO> {
    return this.service.find(searchUser);
  }

  @ApiOperation({ summary: '사용자 목록 조회' })
  @ApiResponse({ status: 200, type: UserRO })
  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(AuthenticatedGuard)
  @Get(':id')
  async findUser(@Param("id") id: string): Promise<UserRO> {
    return this.service.findUser(id);
  }

  @ApiBody({ type: CreateUserDto })
  @ApiOperation({ summary: '사용자 등록' })
  @ApiResponse({ status: 201, type: UserRO })
  @UseInterceptors(ClassSerializerInterceptor)
  @Post()
  async addUser(@Body() userDto: CreateUserDto): Promise<UserRO> {
    return await this.service.save(userDto);
  }

  @ApiBody({ type: ModifyUserDto })
  @ApiOperation({ summary: '사용자 수정' })
  @ApiResponse({ status: 200, type: UserRO })
  @UseInterceptors(ClassSerializerInterceptor)
  @Put(':id')
  async modifyUser(@Param("id") id: string, @Body() userDto: ModifyUserDto): Promise<UserRO> {
    return await this.service.update(id, userDto);
  }

  @ApiOperation({ summary: '사용자 삭제' })
  @ApiResponse({ status: 200, })
  @UseInterceptors(ClassSerializerInterceptor)
  @Delete(':id')
  async deleteUser(@Param("id") id: string,): Promise<void> {
    await this.service.remove(id);
  }
}
