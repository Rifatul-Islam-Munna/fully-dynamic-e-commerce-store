import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CartService } from './cart.service';
import { CartItem } from './entities/cart-item.entity';
import { Product } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';

describe('CartService', () => {
  let service: CartService;
  let cartRepository: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };
  let productRepository: {
    findOne: jest.Mock;
  };
  let variantRepository: {
    findOne: jest.Mock;
  };

  beforeEach(async () => {
    cartRepository = {
      findOne: jest.fn(),
      create: jest.fn((value) => value),
      save: jest.fn(async (value) => value),
    };

    productRepository = {
      findOne: jest.fn(),
    };

    variantRepository = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: getRepositoryToken(CartItem),
          useValue: cartRepository,
        },
        {
          provide: getRepositoryToken(Product),
          useValue: productRepository,
        },
        {
          provide: getRepositoryToken(ProductVariant),
          useValue: variantRepository,
        },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('ignores stale variant ids for simple products', async () => {
    productRepository.findOne.mockResolvedValue({
      id: 'simple-1',
      price: 500,
      discountPrice: null,
      hasVariants: false,
      isActive: true,
    });
    cartRepository.findOne.mockResolvedValue(null);

    await service.create(
      { id: 'user-1' } as never,
      {
        productId: 'simple-1',
        productVariantId: 'stale-variant-id',
        quantity: 1,
      },
    );

    expect(variantRepository.findOne).not.toHaveBeenCalled();
    expect(cartRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        productId: 'simple-1',
        productVariantId: null,
        unitPrice: 500,
        unitDiscountPrice: null,
        quantity: 1,
      }),
    );
  });
});
