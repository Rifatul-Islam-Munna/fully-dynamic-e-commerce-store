import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import {
  PRODUCT_CARD_VARIANT_VALUES,
  PRODUCT_DETAILS_VARIANT_VALUES,
  SITE_THEME_VALUES,
} from '../entities/site-setting.entity';

export class CreateSiteSettingDto {
  @ApiPropertyOptional({
    description: 'Logical key for site settings',
    example: 'default',
  })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  key?: string;

  @ApiProperty({
    description: 'Website title',
    example: 'Niqab Store',
  })
  @IsString()
  @MaxLength(200)
  siteTitle: string;

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
    description: 'Optional WhatsApp support link for the floating contact button',
    example: 'https://wa.me/8801900000000',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  whatsappLink?: string;

  @ApiPropertyOptional({
    description: 'Optional Tawk.to support link for the floating contact button',
    example: 'https://tawk.to/chat/example/default',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  tawkToLink?: string;

  @ApiPropertyOptional({
    description: 'Whether customers can use the regular place-order button',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  showPlaceOrderButton?: boolean;

  @ApiPropertyOptional({
    description: 'Whether customers can use the bKash checkout button',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  showBkashCheckoutButton?: boolean;

  @ApiPropertyOptional({
    description: 'Enable top-site notice bar',
    example: true,
    default: false,
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
    description: 'Write-only bKash app key stored for internal payment use',
    example: 'sandbox_app_key',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  bkashAppKey?: string;

  @ApiPropertyOptional({
    description: 'Write-only bKash app secret stored for internal payment use',
    example: 'sandbox_app_secret',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  bkashAppSecret?: string;

  @ApiPropertyOptional({
    description: 'Write-only bKash username stored for internal payment use',
    example: 'sandbox_username',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  bkashUsername?: string;

  @ApiPropertyOptional({
    description: 'Write-only bKash password stored for internal payment use',
    example: 'sandbox_password',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  bkashPassword?: string;

  @ApiPropertyOptional({
    description: 'Whether this config is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
