import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { CreateHomeSettingDto } from './create-home-setting.dto';

export class UpdateHomeSettingDto extends PartialType(CreateHomeSettingDto) {
  @ApiPropertyOptional({
    description: 'Homepage settings entity id for patch target (optional)',
    example: '7d7ef387-6f88-4acc-b023-30d941c35d20',
  })
  @IsOptional()
  @IsUUID()
  homeSettingId?: string;

  @ApiPropertyOptional({
    description: 'Target main navbar URL',
    example: '/shop',
  })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  mainNavUrl?: string;

  @ApiPropertyOptional({
    description: 'Target sub navbar URL',
    example: '/shop/men',
  })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  subNavUrl?: string;
}
