import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class DeleteProductQueryDto {
  @ApiProperty({
    description: 'Product id to delete',
    example: 'de1224d2-cd0b-4f91-8128-2ddb58dcfe18',
  })
  @IsUUID()
  productId: string;
}
