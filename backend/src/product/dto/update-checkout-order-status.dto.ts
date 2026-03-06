import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsUUID } from 'class-validator';
import { CheckoutOrderStatus } from '../entities/checkout-order.entity';

export class UpdateCheckoutOrderStatusDto {
  @ApiProperty({
    description: 'Target order id for status update.',
    example: '3dbd4130-d841-4638-b2f1-bf1857de6f57',
  })
  @IsUUID()
  orderId: string;

  @ApiProperty({
    description: 'Next lifecycle status for the order.',
    enum: CheckoutOrderStatus,
    example: CheckoutOrderStatus.CONFIRMED,
  })
  @IsEnum(CheckoutOrderStatus)
  status: CheckoutOrderStatus;
}
