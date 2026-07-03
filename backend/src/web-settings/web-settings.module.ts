import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebSettingsService } from './web-settings.service';
import { WebSettingsController } from './web-settings.controller';
import { SeoSettingsController } from './seo-settings.controller';
import { SeoSettingsService } from './seo-settings.service';
import { FooterSetting } from './entities/footer-setting.entity';
import { NavbarSetting } from './entities/navbar-setting.entity';
import { HomeSetting } from './entities/home-setting.entity';
import { SiteSetting } from './entities/site-setting.entity';
import { SeoSetting } from './entities/seo-setting.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    NavbarSetting,
    FooterSetting,
    SiteSetting,
    HomeSetting,
    SeoSetting,
  ])],
  controllers: [WebSettingsController, SeoSettingsController],
  providers: [WebSettingsService, SeoSettingsService],
})
export class WebSettingsModule {}
