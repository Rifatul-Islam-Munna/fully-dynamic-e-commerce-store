import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class CreateCartItemDto {
  @ApiProperty({
    description: 'Product id to add into cart',
    example: 'de1224d2-cd0b-4f91-8128-2ddb58dcfe18',
  })
  @IsUUID()
  productId: string;

  @ApiPropertyOptional({
    description: 'Variant id for variant products',
    example: '42ce0bf1-4593-4c1e-bf0f-9af7fdfefe9e',
  })
  @IsOptional()
  @IsUUID()
  productVariantId?: string;

  @ApiPropertyOptional({
    description: 'Quantity to add',
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
