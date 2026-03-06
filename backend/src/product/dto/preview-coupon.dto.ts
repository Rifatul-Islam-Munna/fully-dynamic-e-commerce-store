import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { CreateCheckoutItemDto } from './create-checkout.dto';

export class PreviewCouponDto {
  @ApiProperty({
    description: 'Coupon code to preview',
    example: 'EID10',
  })
  @IsString()
  @MaxLength(60)
  code: string;

  @ApiProperty({
    description: 'Current checkout items for pricing preview',
    type: () => [CreateCheckoutItemDto],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateCheckoutItemDto)
  items: CreateCheckoutItemDto[];
}
