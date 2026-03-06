import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Query,
  Req,
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
import { Roles } from '../../lib/roles.decorator';
import { RolesGuard } from '../../lib/roles.guard';
import { UserRole } from '../user/entities/user.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { DeleteProductQueryDto } from './dto/delete-product-query.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { ProductService } from './product.service';

@ApiTags('Products')
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Create product (admin only)',
    description:
      'Creates product with or without variants and sale flags in one endpoint.',
  })
  @ApiResponse({
    status: 201,
    description: 'Created product with full details',
    type: Product,
  })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Smart get endpoint (single or paginated list)',
    description:
      'If productId or slug is provided, returns one detailed product (richText included). Otherwise returns paginated list with selected fields (richText excluded).',
  })
  @ApiOkResponse({
    description: 'Single-product or paginated list response',
  })
  findAll(@Req() req: ExpressRequest, @Query() query: ProductQueryDto) {
    return this.productService.findAll(req.user, query);
  }

  @Get('public')
  @ApiOperation({
    summary: 'Public product list/single endpoint',
    description:
      'Public endpoint for storefront sections. Supports search, nav filters, and product flags without auth.',
  })
  @ApiOkResponse({
    description: 'Single-product or paginated list response for public storefront',
  })
  findPublic(@Query() query: ProductQueryDto) {
    return this.productService.findPublic(query);
  }

  @Patch()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Update product (admin only)',
    description:
      'Updates product by `productId` from request body (no route param). Supports toggling variant/simple product mode.',
  })
  @ApiOkResponse({
    description: 'Updated product',
    type: Product,
  })
  update(@Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(updateProductDto);
  }

  @Delete()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Delete product (admin only)',
    description: 'Deletes product using query `productId` (no route param).',
  })
  @ApiOkResponse({
    description: 'Delete status',
  })
  remove(@Query() query: DeleteProductQueryDto) {
    return this.productService.remove(query);
  }
}
