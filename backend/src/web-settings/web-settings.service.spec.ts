import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { WebSettingsService } from './web-settings.service';
import { FooterSetting } from './entities/footer-setting.entity';
import { HomeSetting } from './entities/home-setting.entity';
import { NavbarSetting } from './entities/navbar-setting.entity';
import { SiteSetting } from './entities/site-setting.entity';

describe('WebSettingsService', () => {
  let service: WebSettingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebSettingsService,
        {
          provide: getRepositoryToken(NavbarSetting),
          useValue: {},
        },
        {
          provide: getRepositoryToken(FooterSetting),
          useValue: {},
        },
        {
          provide: getRepositoryToken(SiteSetting),
          useValue: {},
        },
        {
          provide: getRepositoryToken(HomeSetting),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<WebSettingsService>(WebSettingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
