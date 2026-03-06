import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '../../lib/auth.guard';
import type { ExpressRequest } from '../../lib/auth.guard';
import { CartService } from './cart.service';
import { CartQueryDto } from './dto/cart-query.dto';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { DeleteCartItemQueryDto } from './dto/delete-cart-item-query.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartItem } from './entities/cart-item.entity';

@ApiTags('Cart')
@Controller('product/cart')
@UseGuards(AuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  @ApiOperation({
    summary: 'Add product to cart',
    description:
      'Adds product/variant to current user cart. If item already exists, quantity is incremented.',
  })
  @ApiResponse({
    status: 201,
    description: 'Cart item created/updated',
    type: CartItem,
  })
  create(@Req() req: ExpressRequest, @Body() createCartItemDto: CreateCartItemDto) {
    if (!req.user?.id) {
      throw new UnauthorizedException('Invalid token payload');
    }

    return this.cartService.create(req.user, createCartItemDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get cart (single or list)',
    description:
      'If cartItemId is provided, returns one cart item. Otherwise returns paginated cart list for current user.',
  })
  @ApiOkResponse({
    description: 'Single cart item or paginated list response',
  })
  findAll(@Req() req: ExpressRequest, @Query() query: CartQueryDto) {
    if (!req.user?.id) {
      throw new UnauthorizedException('Invalid token payload');
    }

    return this.cartService.findAll(req.user, query);
  }

  @Patch()
  @ApiOperation({
    summary: 'Update cart item quantity',
    description: 'Updates cart item quantity by `cartItemId` from request body.',
  })
  @ApiOkResponse({
    description: 'Updated cart item',
    type: CartItem,
  })
  update(@Req() req: ExpressRequest, @Body() updateCartItemDto: UpdateCartItemDto) {
    if (!req.user?.id) {
      throw new UnauthorizedException('Invalid token payload');
    }

    return this.cartService.update(req.user, updateCartItemDto);
  }

  @Delete()
  @ApiOperation({
    summary: 'Delete cart item or clear cart',
    description:
      'Deletes one cart item by `cartItemId` or clears all items with `clearAll=true`.',
  })
  @ApiOkResponse({
    description: 'Delete result',
  })
  remove(@Req() req: ExpressRequest, @Query() query: DeleteCartItemQueryDto) {
    if (!req.user?.id) {
      throw new UnauthorizedException('Invalid token payload');
    }

    return this.cartService.remove(req.user, query);
  }
}
