import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  HOME_SECTION_TYPES,
  PRODUCT_FLAGS,
} from '../entities/home-setting.entity';

export class HeroSlideDto {
  @ApiPropertyOptional({
    description: 'Optional slide title',
    example: 'Elevate your everyday style',
  })
  @IsOptional()
  @IsString()
  @MaxLength(180)
  title?: string;

  @ApiPropertyOptional({
    description: 'Slide subtitle',
    example: 'Fresh pieces curated for the new season',
  })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  subtitle?: string;

  @ApiProperty({
    description: 'Slide image URL',
    example: 'https://cdn.example.com/home/hero-slide-1.jpg',
  })
  @IsString()
  @MaxLength(500)
  imageUrl: string;

  @ApiPropertyOptional({
    description: 'Slide click-through URL',
    example: '/shop/new-arrivals',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  linkUrl?: string;

  @ApiPropertyOptional({
    description: 'Optional slide button label',
    example: 'Explore',
  })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  buttonLabel?: string;

  @ApiPropertyOptional({
    description: 'Slide order inside hero section',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  sortOrder?: number = 1;

  @ApiPropertyOptional({
    description: 'Whether this slide is active',
    example: true,
    default: true,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean = true;
}

export class HomeSectionDto {
  @ApiPropertyOptional({
    description: 'Optional section client id for update stability',
    example: 'hero-main',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  id?: string;

  @ApiProperty({
    description: 'Section type',
    enum: HOME_SECTION_TYPES,
    example: 'product_collection',
  })
  @IsString()
  @IsIn(HOME_SECTION_TYPES)
  type: (typeof HOME_SECTION_TYPES)[number];

  @ApiPropertyOptional({
    description: 'Section title',
    example: 'Top Picks',
  })
  @IsOptional()
  @IsString()
  @MaxLength(180)
  title?: string;

  @ApiPropertyOptional({
    description: 'Section subtitle',
    example: 'Most loved by customers this week',
  })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  subtitle?: string;

  @ApiPropertyOptional({
    description: 'Section description/body text',
    example: 'Handpicked pieces for everyday essentials.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(600)
  description?: string;

  @ApiPropertyOptional({
    description: 'Generic foreground image URL (custom/banner usage)',
    example: 'https://cdn.example.com/home/section-image.jpg',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'Background image URL (discount/custom usage)',
    example: 'https://cdn.example.com/home/discount-bg.jpg',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  backgroundImageUrl?: string;

  @ApiPropertyOptional({
    description: 'Section CTA button label',
    example: 'Shop Deals',
  })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  buttonLabel?: string;

  @ApiPropertyOptional({
    description: 'Section CTA button URL',
    example: '/discount',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  buttonUrl?: string;

  @ApiPropertyOptional({
    description: 'Product flag filter for product collection section',
    enum: PRODUCT_FLAGS,
    example: 'isHotSells',
  })
  @IsOptional()
  @IsString()
  @IsIn(PRODUCT_FLAGS)
  productFlag?: (typeof PRODUCT_FLAGS)[number];

  @ApiPropertyOptional({
    description: 'Optional main navigation URL filter for products',
    example: '/shop',
  })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  mainNavUrl?: string;

  @ApiPropertyOptional({
    description: 'Optional sub navigation URL filter for products',
    example: '/shop/men',
  })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  subNavUrl?: string;

  @ApiPropertyOptional({
    description: 'Number of products to show for collection section',
    example: 8,
    default: 8,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(24)
  productLimit?: number = 8;

  @ApiPropertyOptional({
    description: 'Optional per-section theme token',
    example: 'glass-light',
  })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  theme?: string;

  @ApiPropertyOptional({
    description: 'Section order',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  sortOrder?: number = 1;

  @ApiPropertyOptional({
    description: 'Whether this section is active',
    example: true,
    default: true,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean = true;

  @ApiPropertyOptional({
    description: 'Hero slides (only used for hero_slider type)',
    type: [HeroSlideDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HeroSlideDto)
  slides?: HeroSlideDto[];
}

export class CreateHomeSettingDto {
  @ApiPropertyOptional({
    description:
      'Target main navbar URL for this page config. Leave empty for global home page config.',
    example: '/shop',
  })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  mainNavUrl?: string;

  @ApiPropertyOptional({
    description: 'Target sub navbar URL for this page config',
    example: '/shop/men',
  })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  subNavUrl?: string;

  @ApiPropertyOptional({
    description: 'Optional global homepage theme token',
    example: 'clean-modern',
  })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  theme?: string;

  @ApiProperty({
    description: 'Ordered homepage sections',
    type: [HomeSectionDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HomeSectionDto)
  sections: HomeSectionDto[];

  @ApiPropertyOptional({
    description: 'Whether this homepage config is active',
    example: true,
    default: true,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean = true;
}
