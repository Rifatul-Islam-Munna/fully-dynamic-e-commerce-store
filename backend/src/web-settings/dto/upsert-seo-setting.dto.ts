import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class UpsertSeoSettingDto {
  @ApiProperty({
    description: 'Page path. Use * for global fallback settings.',
    example: '/shop/men',
  })
  @IsString()
  @MaxLength(300)
  path: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  imageUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  canonicalUrl?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  robotsIndex?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  robotsFollow?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  structuredData?: Record<string, unknown>;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  gtmEnabled?: boolean;

  @ApiPropertyOptional({ example: 'GTM-ABC1234' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  @Matches(/^GTM-[A-Z0-9]+$/i, {
    message: 'gtmContainerId must use the GTM-XXXXXXX format',
  })
  gtmContainerId?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
