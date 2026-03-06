import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class WebSettingQueryDto {
  @ApiPropertyOptional({
    description: 'Settings key to fetch/update. Defaults to `default`.',
    example: 'default',
    default: 'default',
  })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  key?: string;

  @ApiPropertyOptional({
    description: 'Optional main navbar URL target for page-specific settings',
    example: '/shop',
  })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  mainNavUrl?: string;

  @ApiPropertyOptional({
    description: 'Optional sub navbar URL target for page-specific settings',
    example: '/shop/men',
  })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  subNavUrl?: string;
}
