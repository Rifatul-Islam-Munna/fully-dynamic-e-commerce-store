import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class FooterSocialLinkDto {
  @ApiProperty({
    description: 'Social platform name',
    example: 'facebook',
  })
  @IsString()
  @MaxLength(80)
  platform: string;

  @ApiProperty({
    description: 'Social profile URL',
    example: 'https://facebook.com/niqab-store',
  })
  @IsString()
  @MaxLength(500)
  url: string;

  @ApiPropertyOptional({
    description: 'Optional social icon/image URL',
    example: 'https://cdn.example.com/social/facebook.png',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  imageUrl?: string;
}

export class FooterLinkDto {
  @ApiProperty({
    description: 'Footer link label',
    example: 'Contact Us',
  })
  @IsString()
  @MaxLength(120)
  label: string;

  @ApiProperty({
    description: 'Footer link URL',
    example: '/contact',
  })
  @IsString()
  @MaxLength(300)
  url: string;

  @ApiPropertyOptional({
    description: 'Optional image for this footer link',
    example: 'https://cdn.example.com/footer/contact.png',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  imageUrl?: string;
}

export class FooterSectionDto {
  @ApiProperty({
    description: 'Footer section title',
    example: 'Support',
  })
  @IsString()
  @MaxLength(120)
  title: string;

  @ApiProperty({
    description: 'Links inside this footer section',
    type: [FooterLinkDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FooterLinkDto)
  links: FooterLinkDto[];
}

export class CreateFooterSettingDto {
  @ApiPropertyOptional({
    description: 'Footer settings key. Defaults to `default`.',
    example: 'default',
    default: 'default',
  })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  key?: string = 'default';

  @ApiProperty({
    description: 'Primary footer title',
    example: 'Niqab Store',
  })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({
    description: 'Footer subtitle/description',
    example: 'Modest fashion for everyone',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    description: 'Footer logo image URL',
    example: 'https://cdn.example.com/footer/logo.png',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  logoImageUrl?: string;

  @ApiPropertyOptional({
    description: 'Global brand image URL',
    example: 'https://cdn.example.com/logo.png',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  brandImageUrl?: string;

  @ApiPropertyOptional({
    description: 'Footer copyright text',
    example: 'Copyright 2026 Niqab Store',
  })
  @IsOptional()
  @IsString()
  @MaxLength(250)
  copyrightText?: string;

  @ApiProperty({
    description: 'Footer social links',
    type: [FooterSocialLinkDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FooterSocialLinkDto)
  socialLinks: FooterSocialLinkDto[];

  @ApiPropertyOptional({
    description: 'Optional grouped footer link sections',
    type: [FooterSectionDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FooterSectionDto)
  sections?: FooterSectionDto[];

  @ApiPropertyOptional({
    description: 'Whether this footer config is active',
    example: true,
    default: true,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean = true;
}
