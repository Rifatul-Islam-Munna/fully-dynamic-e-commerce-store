import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import {
  PRODUCT_CARD_VARIANT_VALUES,
  PRODUCT_DETAILS_VARIANT_VALUES,
  SITE_THEME_VALUES,
} from '../entities/site-setting.entity';

export class UpdateSiteSettingDto {
  @ApiPropertyOptional({
    description: 'Site setting ID to update',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsOptional()
  @IsUUID()
  siteSettingId?: string;

  @ApiPropertyOptional({
    description: 'Update the key',
    example: 'default',
  })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  key?: string;

  @ApiPropertyOptional({
    description: 'Website title',
    example: 'Niqab Store',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  siteTitle?: string;

  @ApiPropertyOptional({
    description: 'Website meta description',
    example: 'Premium modest fashion and accessories',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  metaDescription?: string;

  @ApiPropertyOptional({
    description: 'Website logo URL',
    example: 'https://cdn.example.com/logo.png',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  logoUrl?: string;

  @ApiPropertyOptional({
    description: 'Website favicon URL',
    example: 'https://cdn.example.com/favicon.ico',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  faviconUrl?: string;

  @ApiPropertyOptional({
    description: 'Open Graph image URL',
    example: 'https://cdn.example.com/og-image.png',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  ogImageUrl?: string;

  @ApiPropertyOptional({
    description: 'Enable top-site notice bar',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  noticeEnabled?: boolean;

  @ApiPropertyOptional({
    description: 'Top-site notice message',
    example: 'Flash sale ends tonight at midnight.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  noticeText?: string;

  @ApiPropertyOptional({
    description: 'Global storefront theme preset',
    enum: SITE_THEME_VALUES,
    example: 'light',
  })
  @IsOptional()
  @IsString()
  @IsIn([...SITE_THEME_VALUES])
  siteTheme?: string;

  @ApiPropertyOptional({
    description: 'Global product card layout variant',
    enum: PRODUCT_CARD_VARIANT_VALUES,
    example: 'classic',
  })
  @IsOptional()
  @IsString()
  @IsIn([...PRODUCT_CARD_VARIANT_VALUES])
  productCardVariant?: string;

  @ApiPropertyOptional({
    description: 'Global product details layout variant',
    enum: PRODUCT_DETAILS_VARIANT_VALUES,
    example: 'classic',
  })
  @IsOptional()
  @IsString()
  @IsIn([...PRODUCT_DETAILS_VARIANT_VALUES])
  productDetailsVariant?: string;

  @ApiPropertyOptional({
    description: 'Whether this config is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
