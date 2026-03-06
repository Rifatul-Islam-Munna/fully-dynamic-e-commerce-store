import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthGuard } from '../../lib/auth.guard';

describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    const moduleBuilder = Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            signup: jest.fn(),
            login: jest.fn(),
            getMyProfile: jest.fn(),
            adminGetUsers: jest.fn(),
            updateUser: jest.fn(),
            deleteUser: jest.fn(),
          },
        },
      ],
    });

    moduleBuilder.overrideGuard(AuthGuard).useValue({
      canActivate: jest.fn(() => true),
    });

    const module: TestingModule = await moduleBuilder.compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
