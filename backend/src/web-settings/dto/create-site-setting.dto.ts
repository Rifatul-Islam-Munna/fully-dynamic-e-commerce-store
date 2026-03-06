import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

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
    description: 'Whether this config is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
