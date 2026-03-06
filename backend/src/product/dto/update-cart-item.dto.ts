import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsUUID, Max, Min } from 'class-validator';

export class UpdateCartItemDto {
  @ApiProperty({
    description: 'Target cart item id',
    example: '1147d1d9-6f26-4857-8e8e-57b3221d9700',
  })
  @IsUUID()
  cartItemId: string;

  @ApiProperty({
    description: 'Updated quantity',
    example: 3,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  quantity: number;
}
