import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateProductVariantDto {
  @ApiProperty({
    description: 'Variant title',
    example: 'Size M / Black',
  })
  @IsString()
  @MaxLength(160)
  title: string;

  @ApiPropertyOptional({
    description: 'Variant sku',
    example: 'TSHIRT-BLK-M',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  sku?: string;

  @ApiProperty({
    description: 'Variant price',
    example: 1590,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({
    description: 'Variant discount price',
    example: 1390,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  discountPrice?: number | null;

  @ApiPropertyOptional({
    description: 'Variant stock',
    example: 25,
    default: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional({
    description: 'Variant active state',
    example: true,
    default: true,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Variant sort order',
    example: 1,
    default: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(10000)
  sortOrder?: number;

  @ApiPropertyOptional({
    description: 'Variant attributes as string array',
    example: ['M', 'Black'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(80, { each: true })
  attributes?: string[];
}
