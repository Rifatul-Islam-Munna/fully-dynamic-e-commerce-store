import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class CartQueryDto {
  @ApiPropertyOptional({
    description:
      'Single cart item lookup by id. If present returns one item, otherwise returns paginated list.',
    example: '1147d1d9-6f26-4857-8e8e-57b3221d9700',
  })
  @IsOptional()
  @IsUUID()
  cartItemId?: string;

  @ApiPropertyOptional({
    description: 'Page number for list mode',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 20,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
