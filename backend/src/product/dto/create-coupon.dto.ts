import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { CouponType } from '../entities/coupon.entity';

export class CreateCouponDto {
  @ApiProperty({
    description: 'Coupon code used at checkout',
    example: 'EID10',
  })
  @IsString()
  @MaxLength(60)
  code: string;

  @ApiProperty({
    description: 'Coupon discount type',
    enum: CouponType,
    example: CouponType.PERCENTAGE,
  })
  @IsEnum(CouponType)
  type: CouponType;

  @ApiProperty({
    description:
      'Coupon value. Percentage coupons use percent, value coupons use fixed amount.',
    example: 10,
  })
  @Type(() => Number)
  @Min(0.01)
  amount: number;

  @ApiPropertyOptional({
    description: 'Optional minimum subtotal required to use the coupon',
    example: 1000,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  minOrderTotal?: number | null;

  @ApiPropertyOptional({
    description: 'Optional maximum number of successful uses',
    example: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000000)
  usageLimit?: number | null;

  @ApiPropertyOptional({
    description: 'Optional expiration date in ISO string format',
    example: '2026-12-31T23:59:59.000Z',
  })
  @IsOptional()
  @IsDateString()
  expiresAt?: string | null;

  @ApiPropertyOptional({
    description: 'Optional admin note for the coupon',
    example: 'Eid campaign coupon',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  note?: string | null;

  @ApiPropertyOptional({
    description: 'Whether this coupon is active',
    example: true,
    default: true,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean = true;
}
