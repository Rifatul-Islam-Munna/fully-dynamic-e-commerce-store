import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebSettingsService } from './web-settings.service';
import { WebSettingsController } from './web-settings.controller';
import { FooterSetting } from './entities/footer-setting.entity';
import { NavbarSetting } from './entities/navbar-setting.entity';
import { HomeSetting } from './entities/home-setting.entity';
import { SiteSetting } from './entities/site-setting.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NavbarSetting,
      FooterSetting,
      SiteSetting,
      HomeSetting,
    ]),
  ],
  controllers: [WebSettingsController],
  providers: [WebSettingsService],
})
export class WebSettingsModule {}
