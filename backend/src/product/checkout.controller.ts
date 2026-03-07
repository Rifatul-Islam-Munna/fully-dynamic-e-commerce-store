import { BadRequestException, Body, Controller, Get, Logger, Patch, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthGuard, type ExpressRequest } from '../../lib/auth.guard';
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
  private logger = new Logger(CheckoutController.name);
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
    return this.checkoutService.create(
      createCheckoutDto,
      this.extractAccessToken(req),
    );
  }

  @Post('buy-with-bkash')
  @ApiHeader({
    name: 'access_token',
    description:
      'Optional JWT access token. When present, checkout is linked to the authenticated user.',
    required: false,
  })
  @ApiOperation({
    summary: 'Create bKash checkout session',
    description:
      'Creates a temporary checkout snapshot, starts a bKash payment, and returns the gateway redirect URL.',
  })
  BuyPackages(@Req() req: Request, @Body() createCheckoutDto: CreateCheckoutDto) {
    return this.checkoutService.createPayment(
      createCheckoutDto,
      this.extractAccessToken(req),
    );
  }

    @Get("execute-payment-callback")
 async executePayment(
    @Query('checkoutSessionId') checkoutSessionId: string,
    @Query('paymentID') paymentID: string,
    @Query('status') status: string,
    @Res() res: Response,) {
       if (!checkoutSessionId || !status) {
        this.logger.error('Missing checkoutSessionId or status');
        return res.redirect(
          this.buildPaymentRedirectUrl('failed', {
            message: 'Missing checkout session or payment status',
          }),
        );
      }

      try {
        const result = await this.checkoutService.executePayment(
          checkoutSessionId,
          paymentID,
          status,
        );

        if (result.success && result.order) {
          return res.redirect(
            this.buildPaymentRedirectUrl('successful', {
              orderNumber: result.order.orderNumber,
              paidAmount: String(result.order.paidAmount),
              dueAmount: String(result.order.dueAmount),
              total: String(result.order.total),
            }),
          );
        }

        return res.redirect(
          this.buildPaymentRedirectUrl('failed', {
            message:
              result.reason || 'bKash payment failed or was not completed',
          }),
        );
      } catch (error) {
        this.logger.error(
          'Failed to complete bKash callback',
          error instanceof Error ? error.stack : undefined,
        );
        return res.redirect(
          this.buildPaymentRedirectUrl('failed', {
            message: 'Failed to finish the bKash checkout flow',
          }),
        );
      }
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiHeader({
    name: 'access_token',
    description: 'JWT access token for the current user',
    required: true,
  })
  @ApiOperation({
    summary: 'Get current user checkout dashboard',
    description:
      'Returns account-level order summary, active orders, and recent orders for the authenticated customer dashboard.',
  })
  @ApiOkResponse({
    description: 'Current user checkout dashboard payload',
  })
  findMyOrders(@Req() req: ExpressRequest) {
    return this.checkoutService.findMyOrders(req.user.id);
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

  private extractAccessToken(req: Request) {
    const accessTokenHeader = req.headers['access_token'];
    return Array.isArray(accessTokenHeader)
      ? accessTokenHeader[0]
      : accessTokenHeader;
  }

  private buildPaymentRedirectUrl(
    status: 'successful' | 'failed',
    params: Record<string, string>,
  ) {
    const frontendBaseUrl = process.env.FRONTEND_URL?.trim();

    if (!frontendBaseUrl) {
      throw new BadRequestException('FRONTEND_URL is not configured');
    }

    const url = new URL(`/payment/${status}`, frontendBaseUrl);

    for (const [key, value] of Object.entries(params)) {
      if (value.trim()) {
        url.searchParams.set(key, value);
      }
    }

    return url.toString();
  }
}
