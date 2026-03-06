import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  CheckoutMode,
  CheckoutOrderStatus,
} from '../entities/checkout-order.entity';

export class AdminCheckoutQueryDto {
  @ApiPropertyOptional({
    description: 'Order id for single-order lookup.',
    example: '3dbd4130-d841-4638-b2f1-bf1857de6f57',
  })
  @IsOptional()
  @IsUUID()
  orderId?: string;

  @ApiPropertyOptional({
    description: 'Order number for single-order lookup.',
    example: 'CHK-M7A8Z0-1X9A',
  })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  orderNumber?: string;

  @ApiPropertyOptional({
    description: 'Page number for paginated list mode.',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: 'Page size for paginated list mode.',
    example: 20,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({
    description:
      'Free-text search over order number, customer phone, email, district, and address.',
    example: '01700000000',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by order status.',
    enum: CheckoutOrderStatus,
  })
  @IsOptional()
  @IsEnum(CheckoutOrderStatus)
  status?: CheckoutOrderStatus;

  @ApiPropertyOptional({
    description: 'Filter by checkout mode.',
    enum: CheckoutMode,
  })
  @IsOptional()
  @IsEnum(CheckoutMode)
  checkoutMode?: CheckoutMode;
}
