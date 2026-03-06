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
import {
  CheckoutOrder,
  CheckoutOrderStatus,
} from './entities/checkout-order.entity';
import { CheckoutOrderItem } from './entities/checkout-order-item.entity';

describe('CheckoutService', () => {
  let service: CheckoutService;
  let checkoutOrderRepository: {
    create: jest.Mock;
    save: jest.Mock;
    findOne: jest.Mock;
    exist: jest.Mock;
  };
  let checkoutOrderItemRepository: {
    create: jest.Mock;
    save: jest.Mock;
  };
  let productRepository: {
    findOne: jest.Mock;
    save: jest.Mock;
  };
  let variantRepository: {
    findOne: jest.Mock;
    save: jest.Mock;
  };
  let cartRepository: {
    delete: jest.Mock;
  };
  let couponRepository: {
    increment: jest.Mock;
  };
  let dataSource: {
    transaction: jest.Mock;
  };

  beforeEach(async () => {
    checkoutOrderRepository = {
      create: jest.fn((value) => value),
      save: jest.fn(async (value) => ({ id: 'order-1', ...value })),
      findOne: jest.fn(),
      exist: jest.fn().mockResolvedValue(false),
    };

    checkoutOrderItemRepository = {
      create: jest.fn((value) => value),
      save: jest.fn(async (value) => value),
    };

    productRepository = {
      findOne: jest.fn(),
      save: jest.fn(async (value) => value),
    };

    variantRepository = {
      findOne: jest.fn(),
      save: jest.fn(async (value) => value),
    };

    cartRepository = {
      delete: jest.fn(),
    };

    couponRepository = {
      increment: jest.fn(),
    };

    dataSource = {
      transaction: jest.fn(
        async (
          callback: (manager: {
            getRepository: (entity: unknown) => unknown;
          }) => Promise<unknown>,
        ) =>
        callback({
          getRepository: (entity: unknown) => {
            if (entity === CheckoutOrder) {
              return checkoutOrderRepository;
            }
            if (entity === CheckoutOrderItem) {
              return checkoutOrderItemRepository;
            }
            if (entity === Product) {
              return productRepository;
            }
            if (entity === ProductVariant) {
              return variantRepository;
            }
            if (entity === CartItem) {
              return cartRepository;
            }
            if (entity === Coupon) {
              return couponRepository;
            }

            throw new Error('Unknown repository token');
          },
        }),
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckoutService,
        {
          provide: getRepositoryToken(CheckoutOrder),
          useValue: checkoutOrderRepository,
        },
        {
          provide: getRepositoryToken(CheckoutOrderItem),
          useValue: checkoutOrderItemRepository,
        },
        {
          provide: getRepositoryToken(Product),
          useValue: productRepository,
        },
        {
          provide: getRepositoryToken(ProductVariant),
          useValue: variantRepository,
        },
        {
          provide: getRepositoryToken(CartItem),
          useValue: cartRepository,
        },
        {
          provide: getRepositoryToken(Coupon),
          useValue: couponRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: {},
        },
        {
          provide: DataSource,
          useValue: dataSource,
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
          useValue: {
            validateCoupon: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CheckoutService>(CheckoutService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('decrements tracked stock for simple and variant checkout items', async () => {
    const simpleProduct = {
      id: 'simple-1',
      title: 'Simple Product',
      slug: 'simple-product',
      thumbnailUrl: 'https://cdn.example.com/simple.jpg',
      price: 500,
      discountPrice: null,
      hasVariants: false,
      stock: 4,
      isActive: true,
    };

    const variantProduct = {
      id: 'variant-product-1',
      title: 'Variant Product',
      slug: 'variant-product',
      thumbnailUrl: 'https://cdn.example.com/variant.jpg',
      price: 1000,
      discountPrice: null,
      hasVariants: true,
      stock: null,
      isActive: true,
    };

    const variant = {
      id: 'variant-1',
      productId: 'variant-product-1',
      title: 'Size L',
      price: 1200,
      discountPrice: 1100,
      stock: 3,
      isActive: true,
    };

    productRepository.findOne.mockImplementation(
      async ({ where }: { where: { id?: string } }) => {
      if (where.id === 'simple-1') {
        return simpleProduct;
      }

      if (where.id === 'variant-product-1') {
        return variantProduct;
      }

      return null;
      },
    );

    variantRepository.findOne.mockImplementation(
      async ({ where }: { where: { id?: string } }) => {
      if (where.id === 'variant-1') {
        return variant;
      }

      return null;
      },
    );

    checkoutOrderRepository.findOne.mockResolvedValue({
      id: 'order-1',
      orderNumber: 'CHK-TEST-1',
      items: [],
    });

    const result = await service.create({
      phoneNumber: '01700000000',
      district: 'Dhaka',
      address: 'Mirpur',
      items: [
        {
          productId: 'simple-1',
          quantity: 2,
        },
        {
          productId: 'variant-product-1',
          productVariantId: 'variant-1',
          quantity: 1,
        },
      ],
    });

    expect(checkoutOrderRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        itemCount: 3,
        subtotal: 2100,
        total: 2100,
      }),
    );
    expect(simpleProduct.stock).toBe(2);
    expect(variant.stock).toBe(2);
    expect(productRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'simple-1',
        stock: 2,
      }),
    );
    expect(variantRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'variant-1',
        stock: 2,
      }),
    );
    expect(result).toMatchObject({
      id: 'order-1',
      orderNumber: 'CHK-TEST-1',
    });
  });

  it('restores tracked stock when admin cancels an order', async () => {
    const simpleProduct = {
      id: 'simple-1',
      stock: 2,
    };
    const variant = {
      id: 'variant-1',
      stock: 1,
    };

    productRepository.findOne.mockImplementation(
      async ({ where }: { where: { id?: string } }) => {
        if (where.id === 'simple-1') {
          return simpleProduct;
        }

        return null;
      },
    );

    variantRepository.findOne.mockImplementation(
      async ({ where }: { where: { id?: string } }) => {
        if (where.id === 'variant-1') {
          return variant;
        }

        return null;
      },
    );

    checkoutOrderRepository.findOne
      .mockResolvedValueOnce({
        id: 'order-1',
        orderNumber: 'CHK-TEST-1',
        status: CheckoutOrderStatus.PENDING,
        items: [
          {
            id: 'item-1',
            productId: 'simple-1',
            productVariantId: null,
            quantity: 2,
            productTitle: 'Simple Product',
          },
          {
            id: 'item-2',
            productId: 'variant-product-1',
            productVariantId: 'variant-1',
            quantity: 1,
            productTitle: 'Variant Product',
          },
        ],
      })
      .mockResolvedValueOnce({
        id: 'order-1',
        orderNumber: 'CHK-TEST-1',
        status: CheckoutOrderStatus.CANCELLED,
        items: [],
      });

    await service.updateStatus({
      orderId: 'order-1',
      status: CheckoutOrderStatus.CANCELLED,
    });

    expect(simpleProduct.stock).toBe(4);
    expect(variant.stock).toBe(2);
    expect(productRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'simple-1',
        stock: 4,
      }),
    );
    expect(variantRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'variant-1',
        stock: 2,
      }),
    );
    expect(checkoutOrderRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'order-1',
        status: CheckoutOrderStatus.CANCELLED,
      }),
    );
  });
});
