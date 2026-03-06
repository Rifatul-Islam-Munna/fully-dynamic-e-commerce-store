import { Module } from '@nestjs/common';
import { MinioService } from '../../lib/minio.service';
import { ImageController } from './image.controller';

@Module({
  controllers: [ImageController],
  providers: [MinioService],
})
export class ImageModule {}
