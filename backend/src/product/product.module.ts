import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { CartItem } from './entities/cart-item.entity';
import { CheckoutController } from './checkout.controller';
import { CheckoutService } from './checkout.service';
import { CouponController } from './coupon.controller';
import { CouponService } from './coupon.service';
import { User } from '../user/entities/user.entity';
import { CheckoutOrder } from './entities/checkout-order.entity';
import { CheckoutOrderItem } from './entities/checkout-order-item.entity';
import { Coupon } from './entities/coupon.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { Product } from './entities/product.entity';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      ProductVariant,
      CartItem,
      User,
      CheckoutOrder,
      CheckoutOrderItem,
      Coupon,
    ]),
  ],
  controllers: [
    ProductController,
    CartController,
    CheckoutController,
    CouponController,
  ],
  providers: [ProductService, CartService, CheckoutService, CouponService],
})
export class ProductModule {}
