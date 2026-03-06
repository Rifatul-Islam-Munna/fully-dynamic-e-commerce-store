import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
 
  IsNotEmpty,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { CreateProductVariantDto } from './create-product-variant.dto';

export class CreateProductDto {
  @ApiProperty({
    description: 'Product thumbnail URL',
    example: 'https://cdn.example.com/products/organic-honey/thumb.jpg',
  })
  @IsString()
  
  @MaxLength(500)
  thumbnailUrl: string;

  @ApiPropertyOptional({
    description: 'Additional product image URLs in display order',
    example: [
      'https://cdn.example.com/products/organic-honey/1.jpg',
      'https://cdn.example.com/products/organic-honey/2.jpg',
    ],
  })
  @IsOptional()
  @IsArray()
 
  @MaxLength(500, { each: true })
  imageUrls?: string[];

  @ApiProperty({
    description: 'Product title',
    example: 'Organic Honey',
  })
  @IsString()
  @MaxLength(220)
  title: string;

  @ApiPropertyOptional({
    description: 'Optional slug. If omitted, slug is generated from title.',
    example: 'organic-honey',
  })
  @IsOptional()
  @IsString()
  @MaxLength(260)
  slug?: string;

  @ApiProperty({
    description: 'Base price',
    example: 1200,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({
    description: 'Discounted price',
    example: 990,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  discountPrice?: number | null;

  @ApiProperty({
    description: 'Rich text description',
    example: '<h2>Pure Organic Honey</h2><p>No chemical processing.</p>',
  })
  @IsString()
  richText: string;

  @ApiProperty({
    description: 'Assigned navbar main item URL',
    example: '/shop',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  mainNavUrl: string;

  @ApiPropertyOptional({
    description: 'Assigned navbar sub item URL',
    example: '/shop/honey',
  })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  subNavUrl?: string;

  @ApiPropertyOptional({
    description: 'Whether product has variants',
    example: false,
    default: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  hasVariants?: boolean;

  @ApiPropertyOptional({
    description:
      'Variant list. Required when hasVariants is true. Should be empty for non-variant products.',
    type: () => [CreateProductVariantDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductVariantDto)
  variants?: CreateProductVariantDto[];

  @ApiPropertyOptional({
    description: 'Active status',
    default: true,
    example: true,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Hot selling flag',
    default: false,
    example: true,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isHotSells?: boolean;

  @ApiPropertyOptional({
    description: 'Weekly selling flag',
    default: false,
    example: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isWeeklySell?: boolean;

  @ApiPropertyOptional({
    description: 'Summer selling flag',
    default: false,
    example: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isSummerSell?: boolean;

  @ApiPropertyOptional({
    description: 'Winter selling flag',
    default: false,
    example: true,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isWinterSell?: boolean;

  @ApiPropertyOptional({
    description: 'Best selling flag',
    default: false,
    example: true,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isBestSell?: boolean;
}
