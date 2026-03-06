import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsOptional, IsUUID } from 'class-validator';

export class DeleteCartItemQueryDto {
  @ApiPropertyOptional({
    description:
      'Specific cart item id to delete. If omitted with clearAll=true, all cart items for the current user are deleted.',
    example: '1147d1d9-6f26-4857-8e8e-57b3221d9700',
  })
  @IsOptional()
  @IsUUID()
  cartItemId?: string;

  @ApiPropertyOptional({
    description: 'Delete all cart items of current user',
    example: true,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  clearAll?: boolean;
}
