import { Body, Controller, Get, Patch, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '../../lib/auth.guard';
import { Roles } from '../../lib/roles.decorator';
import { RolesGuard } from '../../lib/roles.guard';
import { UserRole } from '../user/entities/user.entity';
import { CheckoutService } from './checkout.service';
import { CouponService } from './coupon.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { CouponQueryDto } from './dto/coupon-query.dto';
import { PreviewCouponDto } from './dto/preview-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { Coupon } from './entities/coupon.entity';

@ApiTags('Coupons')
@Controller('product/coupon')
export class CouponController {
  constructor(
    private readonly couponService: CouponService,
    private readonly checkoutService: CheckoutService,
  ) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiHeader({
    name: 'access_token',
    description: 'JWT access token for an admin user',
    required: true,
  })
  @ApiOperation({
    summary: 'Create coupon (admin only)',
    description: 'Creates a new coupon code for checkout discounts.',
  })
  @ApiResponse({
    status: 201,
    description: 'Coupon created successfully',
    type: Coupon,
  })
  create(@Body() createCouponDto: CreateCouponDto) {
    return this.couponService.create(createCouponDto);
  }

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiHeader({
    name: 'access_token',
    description: 'JWT access token for an admin user',
    required: true,
  })
  @ApiOperation({
    summary: 'Get coupon (single or list)',
    description:
      'If couponId or code is provided, returns one coupon. Otherwise returns paginated coupon list.',
  })
  @ApiOkResponse({
    description: 'Single-coupon or paginated coupon list response',
  })
  findAll(@Query() query: CouponQueryDto) {
    return this.couponService.findAll(query);
  }

  @Patch()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiHeader({
    name: 'access_token',
    description: 'JWT access token for an admin user',
    required: true,
  })
  @ApiOperation({
    summary: 'Update coupon (admin only)',
    description: 'Updates an existing coupon by couponId in request body.',
  })
  @ApiOkResponse({
    description: 'Updated coupon',
    type: Coupon,
  })
  update(@Body() updateCouponDto: UpdateCouponDto) {
    return this.couponService.update(updateCouponDto);
  }

  @Post('preview')
  @ApiOperation({
    summary: 'Preview coupon against checkout items',
    description:
      'Validates a coupon code against current checkout items and returns recalculated totals.',
  })
  @ApiOkResponse({
    description: 'Coupon preview totals',
  })
  preview(@Body() previewCouponDto: PreviewCouponDto) {
    return this.checkoutService.preview(
      previewCouponDto.items,
      previewCouponDto.code,
    );
  }
}
