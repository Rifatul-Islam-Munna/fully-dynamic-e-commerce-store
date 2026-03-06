import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class ProductQueryDto {
  @ApiPropertyOptional({
    description:
      'Single product lookup by id. If this or slug is provided, endpoint returns one product.',
    example: 'de1224d2-cd0b-4f91-8128-2ddb58dcfe18',
  })
  @IsOptional()
  @IsUUID()
  productId?: string;

  @ApiPropertyOptional({
    description:
      'Single product lookup by slug. If this or productId is provided, endpoint returns one product.',
    example: 'organic-honey',
  })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({
    description: 'Page number for list mode',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page for list mode',
    example: 20,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    description:
      'PostgreSQL full-text search input. Uses websearch_to_tsquery (not regex).',
    example: 'organic honey',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description:
      'Filter by current storefront price greater than or equal to this amount.',
    example: 500,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({
    description:
      'Filter by current storefront price less than or equal to this amount.',
    example: 5000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({
    description: 'Sort list results for storefront/search pages.',
    enum: ['newest', 'price-asc', 'price-desc', 'title-asc'],
    example: 'price-asc',
  })
  @IsOptional()
  @IsString()
  @IsIn(['newest', 'price-asc', 'price-desc', 'title-asc'])
  sort?: 'newest' | 'price-asc' | 'price-desc' | 'title-asc';

  @ApiPropertyOptional({
    description: 'Filter by assigned navbar main URL',
    example: '/shop',
  })
  @IsOptional()
  @IsString()
  mainNavUrl?: string;

  @ApiPropertyOptional({
    description: 'Filter by assigned navbar sub URL',
    example: '/shop/honey',
  })
  @IsOptional()
  @IsString()
  subNavUrl?: string;

  @ApiPropertyOptional({
    description: 'Filter by active status (admin only override).',
    example: true,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isHotSells?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isWeeklySell?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isSummerSell?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isWinterSell?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isBestSell?: boolean;
}
