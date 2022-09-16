import {
  Body,
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
} from '@nestjs/common';
import { ApiBasicAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CacheEvict, NoCache } from 'src/common/core/cache.decorator';
import { AllExceptionsFilter } from '../common/filters/auth-exceptions.filter';
import { AuthenticatedGuard } from '../common/guards/authenticated.guard';
import { CreateUserDto, ModifyUserDto, SearchUserDto, UserRO } from './dto/user.dto';
import { UserService } from './user.service';

@Controller('user')
@ApiTags('사용자')
// @UseFilters(AllExceptionsFilter)
export class UserController {
  constructor(private readonly service: UserService) { }

  @ApiOperation({ summary: 'TEST 사용자 추가 (권한 없이 추가 가능)' })
  @ApiResponse({ status: 200, type: UserRO })
  @ApiBody({ type: CreateUserDto })
  @Post("addTestUser")
  async addTestUser(@Body() userDto: CreateUserDto): Promise<UserRO> {
    return this.service.save(userDto, 'test');
  }


  @ApiOperation({ summary: '사용자 조회' })
  @ApiResponse({ status: 200, type: UserRO })
  @Get()
  async find(@Query() searchUser: SearchUserDto): Promise<UserRO> {
    return this.service.find(searchUser);
  }
  
  @ApiOperation({ summary: '사용자 목록 조회' })
  @ApiResponse({ status: 200, type: UserRO })
  @UseGuards(AuthenticatedGuard)
  @ApiBasicAuth()
  @Get(':id')
  @NoCache()
  async findUser(@Param("id") id: string): Promise<UserRO> {
    return this.service.findUser(id);
  }

  @ApiBody({ type: CreateUserDto })
  @ApiOperation({ summary: '사용자 등록' })
  @ApiResponse({ status: 201, type: UserRO })
  @UseGuards(AuthenticatedGuard)
  @ApiBasicAuth()
  @Post()
  async addUser(@Req() req, @Body() userDto: CreateUserDto): Promise<UserRO> {
    return await this.service.save(userDto, req.user.id);
  }

  @ApiBody({ type: ModifyUserDto })
  @ApiOperation({ summary: '사용자 수정' })
  @ApiResponse({ status: 200, type: UserRO })
  @UseGuards(AuthenticatedGuard)
  @ApiBasicAuth()
  @Put(':id')
  @CacheEvict('user')
  async modifyUser(@Param("id") id: string, @Body() userDto: ModifyUserDto): Promise<UserRO> {
    return await this.service.update(id, userDto);
  }

  @ApiOperation({ summary: '사용자 삭제' })
  @ApiResponse({ status: 200, })
  @UseGuards(AuthenticatedGuard)
  @ApiBasicAuth()
  @Delete(':id')
  async deleteUser(@Param("id") id: string,): Promise<void> {
    await this.service.remove(id);
  }
}
