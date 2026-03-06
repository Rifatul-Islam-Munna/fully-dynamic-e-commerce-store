import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('site_settings')
@Index('idx_site_settings_key', ['key'], { unique: true })
export class SiteSetting {
  @ApiProperty({
    description: 'Unique site settings identifier',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Logical key for site settings',
    example: 'default',
    default: 'default',
  })
  @Column({ type: 'varchar', length: 80, unique: true, default: 'default' })
  key: string;

  @ApiProperty({
    description: 'Website title displayed in browser tab and SEO',
    example: 'Niqab Store',
  })
  @Column({ type: 'varchar', length: 200, default: 'My Store' })
  siteTitle: string;

  @ApiPropertyOptional({
    description: 'Website meta description for SEO',
    example: 'Premium modest fashion and accessories',
  })
  @Column({ type: 'varchar', length: 500, nullable: true })
  metaDescription: string | null;

  @ApiPropertyOptional({
    description: 'Website logo image URL',
    example: 'https://cdn.example.com/logo.png',
  })
  @Column({ type: 'varchar', length: 500, nullable: true })
  logoUrl: string | null;

  @ApiPropertyOptional({
    description: 'Website favicon image URL',
    example: 'https://cdn.example.com/favicon.ico',
  })
  @Column({ type: 'varchar', length: 500, nullable: true })
  faviconUrl: string | null;

  @ApiPropertyOptional({
    description: 'Open Graph image URL for social sharing',
    example: 'https://cdn.example.com/og-image.png',
  })
  @Column({ type: 'varchar', length: 500, nullable: true })
  ogImageUrl: string | null;

  @ApiProperty({
    description: 'Whether the top notice bar is enabled',
    example: false,
    default: false,
  })
  @Column({ type: 'boolean', default: false })
  noticeEnabled: boolean;

  @ApiPropertyOptional({
    description: 'Optional notice text shown on top of the public site',
    example: 'Free shipping on orders over $99 this week',
  })
  @Column({ type: 'varchar', length: 500, nullable: true })
  noticeText: string | null;

  @ApiProperty({
    description: 'Whether this site config is active',
    example: true,
    default: true,
  })
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
