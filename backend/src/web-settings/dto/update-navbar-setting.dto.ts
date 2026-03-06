import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { CreateNavbarSettingDto } from './create-navbar-setting.dto';

export class UpdateNavbarSettingDto extends PartialType(CreateNavbarSettingDto) {
  @ApiPropertyOptional({
    description: 'Navbar entity id for patch target (optional)',
    example: '43f4b750-52eb-42ca-964a-f29d5f68ff8e',
  })
  @IsOptional()
  @IsUUID()
  navbarId?: string;
}

