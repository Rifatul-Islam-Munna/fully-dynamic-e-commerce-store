import { PartialType } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import { CreateCouponDto } from './create-coupon.dto';

export class UpdateCouponDto extends PartialType(CreateCouponDto) {
  @IsUUID()
  couponId: string;
}
