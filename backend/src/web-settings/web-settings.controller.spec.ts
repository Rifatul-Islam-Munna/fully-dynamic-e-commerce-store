import { Test, TestingModule } from '@nestjs/testing';
import { WebSettingsController } from './web-settings.controller';
import { WebSettingsService } from './web-settings.service';
import { AuthGuard } from '../../lib/auth.guard';
import { RolesGuard } from '../../lib/roles.guard';

describe('WebSettingsController', () => {
  let controller: WebSettingsController;

  beforeEach(async () => {
    const moduleBuilder = Test.createTestingModule({
      controllers: [WebSettingsController],
      providers: [
        {
          provide: WebSettingsService,
          useValue: {
            createNavbar: jest.fn(),
            getNavbar: jest.fn(),
            updateNavbar: jest.fn(),
            createFooter: jest.fn(),
            getFooter: jest.fn(),
            updateFooter: jest.fn(),
            createSiteSetting: jest.fn(),
            getSiteSetting: jest.fn(),
            updateSiteSetting: jest.fn(),
            createHomeSetting: jest.fn(),
            getHomeSetting: jest.fn(),
            updateHomeSetting: jest.fn(),
          },
        },
      ],
    });

    moduleBuilder.overrideGuard(AuthGuard).useValue({
      canActivate: jest.fn(() => true),
    });

    moduleBuilder.overrideGuard(RolesGuard).useValue({
      canActivate: jest.fn(() => true),
    });

    const module: TestingModule = await moduleBuilder.compile();

    controller = module.get<WebSettingsController>(WebSettingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
