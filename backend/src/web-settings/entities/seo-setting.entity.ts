import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('seo_settings')
@Index('idx_seo_settings_path', ['path'], { unique: true })
export class SeoSetting {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Page path. Use * for global defaults.',
    example: '/shop/men',
  })
  @Column({ type: 'varchar', length: 300, unique: true })
  path: string;

  @ApiPropertyOptional()
  @Column({ type: 'varchar', length: 200, nullable: true })
  title: string | null;

  @ApiPropertyOptional()
  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string | null;

  @ApiPropertyOptional()
  @Column({ type: 'varchar', length: 500, nullable: true })
  imageUrl: string | null;

  @ApiPropertyOptional()
  @Column({ type: 'varchar', length: 500, nullable: true })
  canonicalUrl: string | null;

  @ApiPropertyOptional({ type: [String] })
  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  keywords: string[];

  @ApiProperty({ default: true })
  @Column({ type: 'boolean', default: true })
  robotsIndex: boolean;

  @ApiProperty({ default: true })
  @Column({ type: 'boolean', default: true })
  robotsFollow: boolean;

  @ApiPropertyOptional({
    description: 'Optional JSON-LD object rendered for this page.',
  })
  @Column({ type: 'jsonb', nullable: true })
  structuredData: Record<string, unknown> | null;

  @ApiProperty({ default: false })
  @Column({ type: 'boolean', default: false })
  gtmEnabled: boolean;

  @ApiPropertyOptional({ example: 'GTM-ABC1234' })
  @Column({ type: 'varchar', length: 40, nullable: true })
  gtmContainerId: string | null;

  @ApiProperty({ default: true })
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
