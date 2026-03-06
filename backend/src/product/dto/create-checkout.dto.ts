import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateCheckoutItemDto {
  @ApiProperty({
    description: 'Product id to checkout',
    example: 'de1224d2-cd0b-4f91-8128-2ddb58dcfe18',
  })
  @IsUUID()
  productId: string;

  @ApiPropertyOptional({
    description: 'Optional selected variant id',
    example: '42ce0bf1-4593-4c1e-bf0f-9af7fdfefe9e',
  })
  @IsOptional()
  @IsUUID()
  productVariantId?: string;

  @ApiPropertyOptional({
    description: 'Requested quantity',
    example: 2,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  quantity?: number = 1;
}

export class CreateCheckoutDto {
  @ApiPropertyOptional({
    description: 'Optional coupon code to apply during checkout',
    example: 'EID10',
  })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  couponCode?: string;

  @ApiPropertyOptional({
    description:
      'Optional contact email. For logged-in users this falls back to account email.',
    example: 'customer@example.com',
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(160)
  email?: string;

  @ApiProperty({
    description: 'Primary checkout phone number',
    example: '+8801700000000',
  })
  @IsString()
  @MaxLength(30)
  phoneNumber: string;

  @ApiProperty({
    description: 'Shipping district / area',
    example: 'Dhaka',
  })
  @IsString()
  @MaxLength(120)
  district: string;

  @ApiProperty({
    description: 'Shipping address',
    example: 'House 11, Road 7, Mirpur DOHS',
  })
  @IsString()
  @MaxLength(500)
  address: string;

  @ApiProperty({
    description: 'Cart line items submitted for checkout',
    type: () => [CreateCheckoutItemDto],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateCheckoutItemDto)
  items: CreateCheckoutItemDto[];
}
