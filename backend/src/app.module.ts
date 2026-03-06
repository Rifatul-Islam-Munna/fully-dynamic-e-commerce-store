import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule,ConfigService } from '@nestjs/config';
import { JwtModule , } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from 'lib/database.module';
import { UserModule } from './user/user.module';
import { WebSettingsModule } from './web-settings/web-settings.module';
import { ProductModule } from './product/product.module';
import { ImageModule } from './image/image.module';

@Module({
  imports: [ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
   JwtModule.register({
      global: true,
      secret: process.env.ACCESS_TOKEN,
      signOptions: { expiresIn: '1d' },
    }),
    DatabaseModule,
    UserModule,
    WebSettingsModule,
    ProductModule,
    ImageModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
