import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { CreateFooterSettingDto } from './create-footer-setting.dto';

export class UpdateFooterSettingDto extends PartialType(CreateFooterSettingDto) {
  @ApiPropertyOptional({
    description: 'Footer entity id for patch target (optional)',
    example: '7c925706-79cf-41fb-89f2-48c9b97948b7',
  })
  @IsOptional()
  @IsUUID()
  footerId?: string;
}

