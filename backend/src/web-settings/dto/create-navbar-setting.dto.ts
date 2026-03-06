import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class SubNavItemDto {
  @ApiProperty({
    description: 'Sub-navigation label text',
    example: 'Men',
  })
  @IsString()
  @MaxLength(120)
  title: string;

  @ApiProperty({
    description: 'Sub-navigation route/url',
    example: '/shop/men',
  })
  @IsString()
  @MaxLength(300)
  url: string;

  @ApiPropertyOptional({
    description: 'Optional image for this sub-nav item',
    example: 'https://cdn.example.com/nav/men.png',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'Sorting position',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  sortOrder?: number = 1;

  @ApiPropertyOptional({
    description: 'Whether this item is visible',
    example: true,
    default: true,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean = true;
}

export class MainNavItemDto {
  @ApiProperty({
    description: 'Main navigation label text',
    example: 'Shop',
  })
  @IsString()
  @MaxLength(120)
  title: string;

  @ApiProperty({
    description: 'Main navigation route/url',
    example: '/shop',
  })
  @IsString()
  @MaxLength(300)
  url: string;

  @ApiPropertyOptional({
    description: 'Optional image for this main-nav item',
    example: 'https://cdn.example.com/nav/shop.png',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'Sorting position',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  sortOrder?: number = 1;

  @ApiPropertyOptional({
    description: 'Whether this item is visible',
    example: true,
    default: true,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean = true;

  @ApiPropertyOptional({
    description: 'Nested sub-navigation items',
    type: [SubNavItemDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubNavItemDto)
  subNav?: SubNavItemDto[] = [];
}

export class CreateNavbarSettingDto {
  @ApiPropertyOptional({
    description: 'Navbar settings key. Defaults to `default`.',
    example: 'default',
    default: 'default',
  })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  key?: string = 'default';

  @ApiProperty({
    description: 'Array of main navigation items',
    type: [MainNavItemDto],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => MainNavItemDto)
  mainNav: MainNavItemDto[];

  @ApiPropertyOptional({
    description: 'Whether this navbar config is active',
    example: true,
    default: true,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean = true;
}
