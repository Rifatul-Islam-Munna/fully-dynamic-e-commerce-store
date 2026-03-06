import { Body, Controller, Get, Patch, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '../../lib/auth.guard';
import { Roles } from '../../lib/roles.decorator';
import { RolesGuard } from '../../lib/roles.guard';
import { UserRole } from '../user/entities/user.entity';
import { CreateFooterSettingDto } from './dto/create-footer-setting.dto';
import { CreateHomeSettingDto } from './dto/create-home-setting.dto';
import { CreateNavbarSettingDto } from './dto/create-navbar-setting.dto';
import { CreateSiteSettingDto } from './dto/create-site-setting.dto';
import { UpdateFooterSettingDto } from './dto/update-footer-setting.dto';
import { UpdateHomeSettingDto } from './dto/update-home-setting.dto';
import { UpdateNavbarSettingDto } from './dto/update-navbar-setting.dto';
import { UpdateSiteSettingDto } from './dto/update-site-setting.dto';
import { WebSettingQueryDto } from './dto/web-setting-query.dto';
import { FooterSetting } from './entities/footer-setting.entity';
import { HomeSetting } from './entities/home-setting.entity';
import { NavbarSetting } from './entities/navbar-setting.entity';
import { SiteSetting } from './entities/site-setting.entity';
import { WebSettingsService } from './web-settings.service';

@ApiTags('Website Settings')
@Controller('web-settings')
export class WebSettingsController {
  constructor(private readonly webSettingsService: WebSettingsService) {}

  // ─── Navbar ───────────────────────────────────────────────

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiHeader({
    name: 'access_token',
    description: 'JWT access token for an admin user',
    required: true,
  })
  @ApiOperation({
    summary: 'Create navbar settings (admin only)',
    description:
      'Creates navbar settings only. Route is separated from footer route.',
  })
  @ApiResponse({
    status: 201,
    description: 'Navbar settings created successfully.',
    type: NavbarSetting,
  })
  @Post('navbar')
  createNavbar(@Body() createDto: CreateNavbarSettingDto) {
    return this.webSettingsService.createNavbar(createDto);
  }

  @ApiOperation({
    summary: 'Get active navbar settings by query key',
    description:
      'Returns active navbar settings only. Uses query only (no route params).',
  })
  @ApiQuery({
    name: 'key',
    required: false,
    description: 'Navbar settings key. Defaults to `default`.',
    example: 'default',
  })
  @ApiOkResponse({
    description: 'Navbar settings payload.',
    type: NavbarSetting,
  })
  @Get('navbar')
  getNavbar(@Query() query: WebSettingQueryDto) {
    return this.webSettingsService.getNavbar(query);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiHeader({
    name: 'access_token',
    description: 'JWT access token for an admin user',
    required: true,
  })
  @ApiOperation({
    summary: 'Update navbar settings (admin only)',
    description:
      'Updates navbar settings only. Pass optional body `navbarId` or query `key`.',
  })
  @ApiQuery({
    name: 'key',
    required: false,
    description: 'Navbar settings key. Defaults to `default`.',
    example: 'default',
  })
  @ApiOkResponse({
    description: 'Updated navbar settings.',
    type: NavbarSetting,
  })
  @Patch('navbar')
  updateNavbar(
    @Query() query: WebSettingQueryDto,
    @Body() updateDto: UpdateNavbarSettingDto,
  ) {
    return this.webSettingsService.updateNavbar(query, updateDto);
  }

  // ─── Footer ───────────────────────────────────────────────

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiHeader({
    name: 'access_token',
    description: 'JWT access token for an admin user',
    required: true,
  })
  @ApiOperation({
    summary: 'Create footer settings (admin only)',
    description:
      'Creates footer settings only. Route is separated from navbar route.',
  })
  @ApiResponse({
    status: 201,
    description: 'Footer settings created successfully.',
    type: FooterSetting,
  })
  @Post('footer')
  createFooter(@Body() createDto: CreateFooterSettingDto) {
    return this.webSettingsService.createFooter(createDto);
  }

  @ApiOperation({
    summary: 'Get active footer settings by query key',
    description:
      'Returns active footer settings only. Uses query only (no route params).',
  })
  @ApiQuery({
    name: 'key',
    required: false,
    description: 'Footer settings key. Defaults to `default`.',
    example: 'default',
  })
  @ApiOkResponse({
    description: 'Footer settings payload.',
    type: FooterSetting,
  })
  @Get('footer')
  getFooter(@Query() query: WebSettingQueryDto) {
    return this.webSettingsService.getFooter(query);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiHeader({
    name: 'access_token',
    description: 'JWT access token for an admin user',
    required: true,
  })
  @ApiOperation({
    summary: 'Update footer settings (admin only)',
    description:
      'Updates footer settings only. Pass optional body `footerId` or query `key`.',
  })
  @ApiQuery({
    name: 'key',
    required: false,
    description: 'Footer settings key. Defaults to `default`.',
    example: 'default',
  })
  @ApiOkResponse({
    description: 'Updated footer settings.',
    type: FooterSetting,
  })
  @Patch('footer')
  updateFooter(
    @Query() query: WebSettingQueryDto,
    @Body() updateDto: UpdateFooterSettingDto,
  ) {
    return this.webSettingsService.updateFooter(query, updateDto);
  }

  // ─── Site Settings ────────────────────────────────────────

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiHeader({
    name: 'access_token',
    description: 'JWT access token for an admin user',
    required: true,
  })
  @ApiOperation({
    summary: 'Create site settings (admin only)',
    description:
      'Creates site-wide settings (logo, favicon, title, meta). One row per key.',
  })
  @ApiResponse({
    status: 201,
    description: 'Site settings created successfully.',
    type: SiteSetting,
  })
  @Post('site')
  createSiteSetting(@Body() createDto: CreateSiteSettingDto) {
    return this.webSettingsService.createSiteSetting(createDto);
  }

  @ApiOperation({
    summary: 'Get active site settings by query key',
    description:
      'Returns active site settings. Public endpoint.',
  })
  @ApiQuery({
    name: 'key',
    required: false,
    description: 'Site settings key. Defaults to `default`.',
    example: 'default',
  })
  @ApiOkResponse({
    description: 'Site settings payload.',
    type: SiteSetting,
  })
  @Get('site')
  getSiteSetting(@Query() query: WebSettingQueryDto) {
    return this.webSettingsService.getSiteSetting(query);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiHeader({
    name: 'access_token',
    description: 'JWT access token for an admin user',
    required: true,
  })
  @ApiOperation({
    summary: 'Update site settings (admin only)',
    description:
      'Updates site-wide settings. Pass optional body `siteSettingId` or query `key`.',
  })
  @ApiQuery({
    name: 'key',
    required: false,
    description: 'Site settings key. Defaults to `default`.',
    example: 'default',
  })
  @ApiOkResponse({
    description: 'Updated site settings.',
    type: SiteSetting,
  })
  @Patch('site')
  updateSiteSetting(
    @Query() query: WebSettingQueryDto,
    @Body() updateDto: UpdateSiteSettingDto,
  ) {
    return this.webSettingsService.updateSiteSetting(query, updateDto);
  }

  // â”€â”€â”€ Home Settings â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiHeader({
    name: 'access_token',
    description: 'JWT access token for an admin user',
    required: true,
  })
  @ApiOperation({
    summary: 'Create homepage settings (admin only)',
    description:
      'Creates ordered homepage sections (hero slider, product sections, discount/custom banners).',
  })
  @ApiResponse({
    status: 201,
    description: 'Homepage settings created successfully.',
    type: HomeSetting,
  })
  @Post('home')
  createHomeSetting(@Body() createDto: CreateHomeSettingDto) {
    return this.webSettingsService.createHomeSetting(createDto);
  }

  @ApiOperation({
    summary: 'Get active page settings by nav target',
    description: 'Returns active homepage settings. Public endpoint.',
  })
  @ApiQuery({
    name: 'mainNavUrl',
    required: false,
    description: 'Optional main nav URL target for page-specific config',
    example: '/shop',
  })
  @ApiQuery({
    name: 'subNavUrl',
    required: false,
    description: 'Optional sub nav URL target for page-specific config',
    example: '/shop/men',
  })
  @ApiOkResponse({
    description: 'Homepage settings payload.',
    type: HomeSetting,
  })
  @Get('home')
  getHomeSetting(@Query() query: WebSettingQueryDto) {
    return this.webSettingsService.getHomeSetting(query);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiHeader({
    name: 'access_token',
    description: 'JWT access token for an admin user',
    required: true,
  })
  @ApiOperation({
    summary: 'Update homepage settings (admin only)',
    description:
      'Updates homepage settings. Pass optional body `homeSettingId` or query nav target.',
  })
  @ApiQuery({
    name: 'mainNavUrl',
    required: false,
    description: 'Optional main nav URL target for page-specific config',
    example: '/shop',
  })
  @ApiQuery({
    name: 'subNavUrl',
    required: false,
    description: 'Optional sub nav URL target for page-specific config',
    example: '/shop/men',
  })
  @ApiOkResponse({
    description: 'Updated homepage settings.',
    type: HomeSetting,
  })
  @Patch('home')
  updateHomeSetting(
    @Query() query: WebSettingQueryDto,
    @Body() updateDto: UpdateHomeSettingDto,
  ) {
    return this.webSettingsService.updateHomeSetting(query, updateDto);
  }
}
