// src/database/database.module.ts
import { Module, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { join } from 'path';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        entities: [join(__dirname, '..', '**', '*.entity{.ts,.js}')],
        autoLoadEntities: true,
        synchronize: config.get('DB_SYNCHRONIZE') === 'true',
          retryAttempts: 3,       // ← stop after 3 tries
  retryDelay: 3000,
      }),
    }),
  ],
})
export class DatabaseModule implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseModule.name);

  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit() {
    if (this.dataSource.isInitialized) {
      this.logger.log('✅ PostgreSQL connected successfully');
    } else {
      this.logger.error('❌ PostgreSQL connection failed');
    }
  }

  async onModuleDestroy() {
    if (this.dataSource.isInitialized) {
      await this.dataSource.destroy();
      this.logger.warn('🔌 PostgreSQL disconnected');
    }
  }
}
