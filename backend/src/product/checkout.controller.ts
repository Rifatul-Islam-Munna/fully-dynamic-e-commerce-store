import { Body, Controller, Get, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { AuthGuard } from '../../lib/auth.guard';
import { Roles } from '../../lib/roles.decorator';
import { RolesGuard } from '../../lib/roles.guard';
import { UserRole } from '../user/entities/user.entity';
import { CheckoutService } from './checkout.service';
import { AdminCheckoutQueryDto } from './dto/admin-checkout-query.dto';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { UpdateCheckoutOrderStatusDto } from './dto/update-checkout-order-status.dto';
import { CheckoutOrder } from './entities/checkout-order.entity';

@ApiTags('Checkout')
@Controller('product/checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post()
  @ApiHeader({
    name: 'access_token',
    description:
      'Optional JWT access token. When present, checkout is linked to the authenticated user.',
    required: false,
  })
  @ApiOperation({
    summary: 'Create checkout order',
    description:
      'Creates a persisted checkout order from submitted cart items. Supports both guest and authenticated checkout.',
  })
  @ApiCreatedResponse({
    description: 'Checkout order created successfully',
    type: CheckoutOrder,
  })
  create(@Req() req: Request, @Body() createCheckoutDto: CreateCheckoutDto) {
    const accessTokenHeader = req.headers['access_token'];
    const accessToken = Array.isArray(accessTokenHeader)
      ? accessTokenHeader[0]
      : accessTokenHeader;

    return this.checkoutService.create(createCheckoutDto, accessToken);
  }

  @Get('admin')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiHeader({
    name: 'access_token',
    description: 'JWT access token for an admin user',
    required: true,
  })
  @ApiOperation({
    summary: 'Get checkout orders for admin management',
    description:
      'Returns a single order or paginated order list with items, status, and summary counts for the admin dashboard.',
  })
  @ApiOkResponse({
    description: 'Admin checkout order list or single order response',
  })
  findAllAdmin(@Query() query: AdminCheckoutQueryDto) {
    return this.checkoutService.findAllAdmin(query);
  }

  @Patch('admin/status')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiHeader({
    name: 'access_token',
    description: 'JWT access token for an admin user',
    required: true,
  })
  @ApiOperation({
    summary: 'Update checkout order status',
    description:
      'Lets admin confirm or cancel orders. Confirmed orders drive sales analytics. Cancelling restores reserved stock.',
  })
  @ApiOkResponse({
    description: 'Updated checkout order',
    type: CheckoutOrder,
  })
  updateStatus(@Body() updateCheckoutOrderStatusDto: UpdateCheckoutOrderStatusDto) {
    return this.checkoutService.updateStatus(updateCheckoutOrderStatusDto);
  }
}
