import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @ApiProperty({
    description: 'Target product id for update',
    example: 'de1224d2-cd0b-4f91-8128-2ddb58dcfe18',
  })
  @IsUUID()
  productId: string;
}
