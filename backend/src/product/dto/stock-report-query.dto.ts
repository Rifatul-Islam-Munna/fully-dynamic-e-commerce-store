import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class StockReportQueryDto {
  @ApiPropertyOptional({
    description:
      'Products with no sale within this many days are marked as stale.',
    example: 30,
    default: 30,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(7)
  @Max(3650)
  staleAfterDays?: number;

  @ApiPropertyOptional({
    description: 'Products at or below this stock are marked as low stock.',
    example: 5,
    default: 5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(10000)
  lowStockThreshold?: number;

  @ApiPropertyOptional({
    description: 'How many rows to return in highlight lists.',
    example: 8,
    default: 8,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(3)
  @Max(24)
  topLimit?: number;
}
