import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { CheckoutService } from './checkout.service';
import { CouponService } from './coupon.service';
import { User } from '../user/entities/user.entity';
import { CartItem } from './entities/cart-item.entity';
import { Coupon } from './entities/coupon.entity';
import { Product } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { CheckoutOrder } from './entities/checkout-order.entity';
import { CheckoutOrderItem } from './entities/checkout-order-item.entity';

describe('CheckoutService', () => {
  let service: CheckoutService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckoutService,
        {
          provide: getRepositoryToken(CheckoutOrder),
          useValue: {},
        },
        {
          provide: getRepositoryToken(CheckoutOrderItem),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Product),
          useValue: {},
        },
        {
          provide: getRepositoryToken(ProductVariant),
          useValue: {},
        },
        {
          provide: getRepositoryToken(CartItem),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Coupon),
          useValue: {},
        },
        {
          provide: getRepositoryToken(User),
          useValue: {},
        },
        {
          provide: DataSource,
          useValue: {},
        },
        {
          provide: JwtService,
          useValue: {},
        },
        {
          provide: ConfigService,
          useValue: {},
        },
        {
          provide: CouponService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<CheckoutService>(CheckoutService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
