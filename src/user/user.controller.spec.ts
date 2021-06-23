import { CanActivate, ExecutionContext, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';
import { AuthenticatedGuard } from '../common/guards/authenticated.guard';
import { UserEntity } from '../entity/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';


const mockUser = (param) => new UserEntity({ seq: 1, id: 'lahuman', name: '임광규', email: 'lahuman@daum.net', passowrd: '1234', ...param });

class MockRepository {
  async findOne(param) {
    return mockUser(param);
  }
  async find(condition) {
    return [mockUser(condition)];
  }
  async softDelete(id) {

  }
  async save(userInfo: UserEntity) {
    return mockUser(userInfo);
  }
}

const mockAuthGuard: CanActivate = {
  canActivate: (context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    request.user = {
      id: 'lahuman',
      name: "임광규",
      email: 'lahuman@daum.net'
    };
    return request.user;
  }
}

describe('UserController', () => {
  let app: INestApplication;
  let controller: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [UserService,
        {
          provide: getRepositoryToken(UserEntity),
          useClass: MockRepository,
        },
      ],
    })
      .overrideGuard(AuthenticatedGuard).useValue(mockAuthGuard)
      .compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  
  it('사용자 조회', async () => {
    const response = await request(app.getHttpServer())
      .get("/user/1")
      .expect(200);
    expect(JSON.parse(response.text).user.id).toEqual('lahuman');
  });

  it('사용자 추가', async () => {
    const response = await request(app.getHttpServer())
      .post("/user")
      .send({
        id: 'lahuman',
        name: '임광규',
        email: 'lahuman@daum.net',
        password: '1234'
      })
      .expect(201);
    expect(JSON.parse(response.text).user.id).toEqual('lahuman');
  });
});
