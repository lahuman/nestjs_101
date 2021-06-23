import { CanActivate, ExecutionContext, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';
import { AuthenticatedGuard } from '../common/guards/authenticated.guard';
import { UserEntity } from '../entity/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';


const mockUser = (param) => new UserEntity({ seq: 1, id: 'lahuman', name: '임광규', email: 'lahuman@daum.net', passowrd: '1234', regrId: 'lahuman' ...param });

export class MockRepository {
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
    await app.init();
    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('사용자 목록 조회', async () => {
    const response = await request(app.getHttpServer())
      .get("/user")
      .expect(200);
    expect(JSON.parse(response.text).list[0].id).toEqual('lahuman');
  });

  it('사용자 조회', async () => {
    const response = await request(app.getHttpServer())
      .get("/user/lahuman")
      .expect(200);
    expect(JSON.parse(response.text).user.id).toEqual('lahuman');
  });

  it('사용자 등록 실패', async () => {
    // ID 누락으로 오류 발생
    const response = await request(app.getHttpServer())
      .post("/user")
      .send({
        name: '임광규',
        email: 'lahuman@daum.net',
        password: '1234'
      })
      .expect(500);
    const result = JSON.parse(response.text);
    expect(result.exception.response.statusCode).toEqual(400);
    expect(result.exception.response.message[0]).toEqual("id should not be empty");
  });

  it('사용자 등록', async () => {
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

  it('사용자 수정', async () => {
    const response = await request(app.getHttpServer())
      .put("/user/lahuman")
      .send({
        name: '홍길동',
        email: 'lahuman@daum.net',
        password: '1234'
      })
      .expect(200);
    expect(JSON.parse(response.text).user.name).toEqual('홍길동');
  });

  it('사용자 삭제', async () => {
    const response = await request(app.getHttpServer())
      .delete("/user/lahuman")
      .expect(200);
  });

  afterAll(async () => {
    await app.close();
  });
});
