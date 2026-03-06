import {
  CreateBucketCommand,
  DeleteObjectCommand,
  PutBucketPolicyCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createReadStream } from 'fs';

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly logger = new Logger(MinioService.name);
  private s3: S3Client | null = null;
  private isConfigured = false;

  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    this.bucketName =
      this.configService.get<string>('MINIO_BUCKET') ?? 'niqha-public-bukcet';
  }

  async onModuleInit() {
    const minioUrl = this.configService.get<string>('MINIO_URL');
    const accessKeyId = this.configService.get<string>('MINIO_ACCESS_KEY');
    const secretAccessKey = this.configService.get<string>('MINIO_SECRET_KEY');

    if (!minioUrl || !accessKeyId || !secretAccessKey) {
      this.logger.warn(
        'MinIO env is missing (MINIO_URL, MINIO_ACCESS_KEY, MINIO_SECRET_KEY). Upload endpoint will stay unavailable.',
      );
      this.isConfigured = false;
      return;
    }

    this.s3 = new S3Client({
      region: 'us-east-1',
      endpoint: minioUrl,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true,
    });

    try {
      await this.createBucketIfNotExists(this.bucketName);
      await this.makeBucketPublic(this.bucketName);
      this.isConfigured = true;
    } catch (error) {
      this.logger.error(
        `MinIO initialization failed: ${(error as Error).message}`,
      );
      this.isConfigured = false;
      this.s3 = null;
    }
  }

  async createBucketIfNotExists(bucketName: string) {
    if (!this.s3) {
      throw new Error('MinIO S3 client is not initialized');
    }

    try {
      await this.s3.send(new CreateBucketCommand({ Bucket: bucketName }));
      this.logger.log(`Bucket '${bucketName}' created.`);
    } catch (err) {
      if (
        err?.name === 'BucketAlreadyOwnedByYou' ||
        err?.name === 'BucketAlreadyExists'
      ) {
        this.logger.log(`Bucket '${bucketName}' already exists.`);
      } else {
        throw err;
      }
    }
  }

  async makeBucketPublic(bucketName: string) {
    if (!this.s3) {
      throw new Error('MinIO S3 client is not initialized');
    }

    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'PublicRead',
          Effect: 'Allow',
          Principal: '*',
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${bucketName}/*`],
        },
      ],
    };

    await this.s3.send(
      new PutBucketPolicyCommand({
        Bucket: bucketName,
        Policy: JSON.stringify(policy),
      }),
    );
  }

  async uploadFile(filePath: Express.Multer.File) {
    if (!this.s3 || !this.isConfigured) {
      throw new HttpException(
        'Image upload service is not configured on the server',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    if (!filePath?.path || !filePath.filename) {
      throw new HttpException('Invalid upload payload', HttpStatus.BAD_REQUEST);
    }

    try {
      const fileContent = createReadStream(filePath.path);

      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: filePath.filename,
          Body: fileContent,
          ContentType: filePath.mimetype,
        }),
      );

      return `${this.getPublicBaseUrl()}/${this.bucketName}/${filePath.filename}`;
    } catch (err) {
      this.logger.error(`Error uploading file: ${(err as Error).message}`);
      throw new HttpException(
        'Failed to upload file',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteService(fileName: string) {
    if (!this.s3 || !this.isConfigured) {
      throw new HttpException(
        'Image upload service is not configured on the server',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    if (!fileName || typeof fileName !== 'string') {
      throw new HttpException('Invalid file name', HttpStatus.BAD_REQUEST);
    }

    try {
      await this.s3.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: fileName,
        }),
      );

      return true;
    } catch (err) {
      this.logger.error(`Error deleting file: ${(err as Error).message}`);
      throw new HttpException(
        'Can not delete file',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private getPublicBaseUrl() {
    const value =
      this.configService.get<string>('MINIO_PUBLIC_URL') ??
      this.configService.get<string>('MINIO_URL') ??
      '';

    return value.replace(/\/+$/, '');
  }
}
