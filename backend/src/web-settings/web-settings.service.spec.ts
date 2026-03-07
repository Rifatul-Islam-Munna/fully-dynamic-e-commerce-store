import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { WebSettingsService } from './web-settings.service';
import { FooterSetting } from './entities/footer-setting.entity';
import { HomeSetting } from './entities/home-setting.entity';
import { NavbarSetting } from './entities/navbar-setting.entity';
import { SiteSetting } from './entities/site-setting.entity';

describe('WebSettingsService', () => {
  let service: WebSettingsService;
  let siteRepository: {
    exist: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };

  beforeEach(async () => {
    siteRepository = {
      exist: jest.fn().mockResolvedValue(false),
      create: jest.fn((value) => value),
      save: jest.fn(async (value) => ({
        id: 'site-1',
        createdAt: new Date('2026-03-07T00:00:00.000Z'),
        updatedAt: new Date('2026-03-07T00:00:00.000Z'),
        ...value,
      })),
    };

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
          useValue: siteRepository,
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

  it('rejects saving both WhatsApp and Tawk.to links together', async () => {
    await expect(
      service.createSiteSetting({
        siteTitle: 'Demo Store',
        whatsappLink: 'https://wa.me/8801900000000',
        tawkToLink: 'https://tawk.to/chat/demo/default',
      }),
    ).rejects.toThrow(
      'Provide either whatsappLink or tawkToLink in site settings, not both',
    );
  });
});
