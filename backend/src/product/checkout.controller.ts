import { Body, Controller, Post, Req } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiHeader,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { CheckoutService } from './checkout.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
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
}
