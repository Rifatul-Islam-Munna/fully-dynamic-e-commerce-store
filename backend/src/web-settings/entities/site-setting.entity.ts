import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export const SITE_THEME_VALUES = [
  'light',
  'cobalt',
  'emerald',
  'rose',
  'amber',
  'teal',
  'slate',
  'berry',
  'coral',
  'violet',
  'navy',
  'ruby',
  'olive',
  'sky',
  'graphite',
  'sand',
  'ocean',
  'orchid',
  'forest',
  'crimson',
  'denim',
  'sage',
  'plum',
  'espresso',
  'sunset',
] as const;

export const PRODUCT_CARD_VARIANT_VALUES = [
  'classic',
  'compact',
  'editorial',
  'price_strip',
  'badge_focus',
  'spotlight',
  'stacked',
  'minimal',
  'brutalist',
  'luxury',
  'tech_focus',
  'neo_brutalist',
  'modern_glass',
  'nordic_verve',
] as const;

export const PRODUCT_DETAILS_VARIANT_VALUES = [
  'original',
  'classic',
  'showcase',
  'streamlined',
  'gallery_first',
  'buy_panel',
  'storyline',
  'immersive',
  'catalog',
  'commerce_stack',
  'spec_sheet',
  'media_rail',
  'briefing',
  'showroom',
  'retail_suite',
  'overview_split',
  'gallery_stack',
  'merchant_brief',
  'editorial',
  'brutalist',
  'luxury',
  'tech_focus',
  'nordic_verve',
] as const;

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

  @ApiPropertyOptional({
    description: 'Optional WhatsApp support link shown as the floating contact button',
    example: 'https://wa.me/8801900000000',
  })
  @Column({ type: 'varchar', length: 500, nullable: true })
  whatsappLink: string | null;

  @ApiPropertyOptional({
    description: 'Optional Tawk.to support link shown as the floating contact button',
    example: 'https://tawk.to/chat/example/default',
  })
  @Column({ type: 'varchar', length: 500, nullable: true })
  tawkToLink: string | null;

  @ApiProperty({
    description: 'Whether the standard place-order checkout button is visible',
    example: true,
    default: true,
  })
  @Column({ type: 'boolean', default: true })
  showPlaceOrderButton: boolean;

  @ApiProperty({
    description: 'Whether the bKash checkout button is visible',
    example: false,
    default: false,
  })
  @Column({ type: 'boolean', default: false })
  showBkashCheckoutButton: boolean;

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
    description: 'Global storefront theme preset selected by admin',
    enum: SITE_THEME_VALUES,
    example: 'light',
    default: 'light',
  })
  @Column({ type: 'varchar', length: 40, default: 'light' })
  siteTheme: string;

  @ApiProperty({
    description: 'Global product card layout variant selected by admin',
    enum: PRODUCT_CARD_VARIANT_VALUES,
    example: 'classic',
    default: 'classic',
  })
  @Column({ type: 'varchar', length: 40, default: 'classic' })
  productCardVariant: string;

  @ApiProperty({
    description: 'Global product details layout variant selected by admin',
    enum: PRODUCT_DETAILS_VARIANT_VALUES,
    example: 'classic',
    default: 'classic',
  })
  @Column({ type: 'varchar', length: 40, default: 'classic' })
  productDetailsVariant: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    select: false,
  })
  bkashAppKey: string | null;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    select: false,
  })
  bkashAppSecret: string | null;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    select: false,
  })
  bkashUsername: string | null;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    select: false,
  })
  bkashPassword: string | null;

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
