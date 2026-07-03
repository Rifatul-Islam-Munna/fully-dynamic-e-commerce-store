import { Body, Controller, Get, Patch, Query, UseGuards } from '@nestjs/common';
import {
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '../../lib/auth.guard';
import { Roles } from '../../lib/roles.decorator';
import { RolesGuard } from '../../lib/roles.guard';
import { UserRole } from '../user/entities/user.entity';
import { UpsertSeoSettingDto } from './dto/upsert-seo-setting.dto';
import { SeoSettingsService } from './seo-settings.service';

@ApiTags('Website SEO')
@Controller('web-settings')
export class SeoSettingsController {
  constructor(private readonly seoSettingsService: SeoSettingsService) {}

  @ApiOperation({
    summary: 'Resolve active SEO and tracking settings for a page path',
  })
  @ApiQuery({
    name: 'path',
    required: false,
    example: '/shop/men',
  })
  @ApiOkResponse({
    description: 'Merged global and page-specific SEO settings.',
  })
  @Get('seo')
  getPublic(@Query('path') path?: string) {
    return this.seoSettingsService.getPublic(path);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiHeader({
    name: 'access_token',
    description: 'JWT access token for an admin user',
    required: true,
  })
  @ApiOperation({
    summary: 'List all page SEO and tracking settings (admin only)',
  })
  @Get('seo/admin')
  listAdmin() {
    return this.seoSettingsService.listAdmin();
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiHeader({
    name: 'access_token',
    description: 'JWT access token for an admin user',
    required: true,
  })
  @ApiOperation({
    summary: 'Create or update SEO and tracking settings for a path',
  })
  @Patch('seo')
  upsert(@Body() dto: UpsertSeoSettingDto) {
    return this.seoSettingsService.upsert(dto);
  }
}
