import {
  BadRequestException,
  Controller,
  HttpCode,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { mkdirSync } from 'fs';
import { unlink } from 'fs/promises';
import { randomUUID } from 'crypto';
import { AuthGuard } from '../../lib/auth.guard';
import { Roles } from '../../lib/roles.decorator';
import { RolesGuard } from '../../lib/roles.guard';
import { MinioService } from '../../lib/minio.service';
import { UserRole } from '../user/entities/user.entity';

const uploadDir = join(process.cwd(), 'tmp', 'uploads');
const allowedImageMime = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'image/avif',
]);

@ApiTags('Images')
@Controller('image')
export class ImageController {
  constructor(private readonly minioService: MinioService) {}

  @Post('upload-image')
  @HttpCode(200)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          mkdirSync(uploadDir, { recursive: true });
          cb(null, uploadDir);
        },
        filename: (_req, file, cb) => {
          const extension = extname(file.originalname || '').toLowerCase();
          cb(null, `${Date.now()}-${randomUUID()}${extension || '.bin'}`);
        },
      }),
      limits: {
        fileSize: 8 * 1024 * 1024,
      },
      fileFilter: (_req, file, cb) => {
        if (!allowedImageMime.has(file.mimetype)) {
          cb(
            new BadRequestException(
              'Invalid file type. Allowed: jpg, png, webp, gif, svg, avif',
            ),
            false,
          );
          return;
        }
        cb(null, true);
      },
    }),
  )
  @ApiHeader({
    name: 'access_token',
    description: 'JWT access token for an admin user',
    required: true,
  })
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload an image file (admin only)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['file'],
    },
  })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        url: { type: 'string', example: 'https://cdn.example.com/path/image.png' },
      },
    },
  })
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    return this.uploadAndCleanup(file);
  }

  @Post('upload-avatar')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          mkdirSync(uploadDir, { recursive: true });
          cb(null, uploadDir);
        },
        filename: (_req, file, cb) => {
          const extension = extname(file.originalname || '').toLowerCase();
          cb(null, `${Date.now()}-${randomUUID()}${extension || '.bin'}`);
        },
      }),
      limits: {
        fileSize: 8 * 1024 * 1024,
      },
      fileFilter: (_req, file, cb) => {
        if (!allowedImageMime.has(file.mimetype)) {
          cb(
            new BadRequestException(
              'Invalid file type. Allowed: jpg, png, webp, gif, svg, avif',
            ),
            false,
          );
          return;
        }
        cb(null, true);
      },
    }),
  )
  @ApiHeader({
    name: 'access_token',
    description: 'JWT access token for an authenticated user',
    required: true,
  })
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload an avatar image file (authenticated user)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['file'],
    },
  })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        url: { type: 'string', example: 'https://cdn.example.com/path/avatar.png' },
      },
    },
  })
  async uploadAvatar(@UploadedFile() file: Express.Multer.File) {
    return this.uploadAndCleanup(file);
  }

  private async uploadAndCleanup(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    try {
      const url = await this.minioService.uploadFile(file);
      return { url };
    } finally {
      if (file?.path) {
        await unlink(file.path).catch(() => undefined);
      }
    }
  }
}
