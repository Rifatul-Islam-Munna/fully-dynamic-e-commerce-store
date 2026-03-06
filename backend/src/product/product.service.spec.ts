import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductService } from './product.service';
import { Product } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { CheckoutOrderItem } from './entities/checkout-order-item.entity';

function createQueryBuilderMock() {
  return {
    innerJoin: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
  };
}

describe('ProductService', () => {
  let service: ProductService;
  let productRepository: {
    find: jest.Mock;
    query: jest.Mock;
    manager: { transaction: jest.Mock };
  };
  let checkoutOrderItemRepository: {
    createQueryBuilder: jest.Mock;
  };

  beforeEach(async () => {
    productRepository = {
      find: jest.fn(),
      query: jest.fn(),
      manager: {
        transaction: jest.fn(),
      },
    };

    checkoutOrderItemRepository = {
      createQueryBuilder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getRepositoryToken(Product),
          useValue: productRepository,
        },
        {
          provide: getRepositoryToken(ProductVariant),
          useValue: {},
        },
        {
          provide: getRepositoryToken(CheckoutOrderItem),
          useValue: checkoutOrderItemRepository,
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('builds stock report with summary, highlights, and aging products', async () => {
    const productSalesQuery = createQueryBuilderMock();
    const variantSalesQuery = createQueryBuilderMock();

    checkoutOrderItemRepository.createQueryBuilder
      .mockReturnValueOnce(productSalesQuery)
      .mockReturnValueOnce(variantSalesQuery);

    productRepository.find.mockResolvedValue([
      {
        id: 'simple-product',
        title: 'Simple Oil',
        slug: 'simple-oil',
        thumbnailUrl: 'https://cdn.example.com/simple.jpg',
        isActive: true,
        mainNavUrl: '/shop',
        subNavUrl: '/shop/oil',
        hasVariants: false,
        stock: 2,
        price: 500,
        discountPrice: 450,
        variants: [],
        createdAt: new Date('2025-11-01T00:00:00.000Z'),
        updatedAt: new Date('2026-03-01T00:00:00.000Z'),
      },
      {
        id: 'variant-product',
        title: 'Winter Hoodie',
        slug: 'winter-hoodie',
        thumbnailUrl: 'https://cdn.example.com/hoodie.jpg',
        isActive: true,
        mainNavUrl: '/fashion',
        subNavUrl: '/fashion/hoodie',
        hasVariants: true,
        stock: null,
        price: 1200,
        discountPrice: null,
        variants: [
          {
            id: 'variant-s',
            title: 'Small',
            sku: 'HD-S',
            stock: 5,
            price: 1200,
            discountPrice: 1000,
            isActive: true,
            sortOrder: 1,
          },
          {
            id: 'variant-m',
            title: 'Medium',
            sku: 'HD-M',
            stock: 0,
            price: 1200,
            discountPrice: null,
            isActive: true,
            sortOrder: 2,
          },
        ],
        createdAt: new Date('2025-09-01T00:00:00.000Z'),
        updatedAt: new Date('2026-03-01T00:00:00.000Z'),
      },
      {
        id: 'pending-stock',
        title: 'Loose Spice',
        slug: 'loose-spice',
        thumbnailUrl: 'https://cdn.example.com/spice.jpg',
        isActive: false,
        mainNavUrl: '/spices',
        subNavUrl: null,
        hasVariants: false,
        stock: null,
        price: 200,
        discountPrice: null,
        variants: [],
        createdAt: new Date('2025-10-01T00:00:00.000Z'),
        updatedAt: new Date('2026-03-01T00:00:00.000Z'),
      },
    ]);

    productSalesQuery.getRawMany.mockResolvedValue([
      {
        productId: 'simple-product',
        soldUnits: '12',
        revenue: '5400',
        orderCount: '7',
        lastSoldAt: '2026-03-04T00:00:00.000Z',
      },
      {
        productId: 'variant-product',
        soldUnits: '40',
        revenue: '43000',
        orderCount: '18',
        lastSoldAt: '2026-01-01T00:00:00.000Z',
      },
    ]);

    variantSalesQuery.getRawMany.mockResolvedValue([
      {
        productVariantId: 'variant-s',
        soldUnits: '28',
        revenue: '28000',
        lastSoldAt: '2026-01-01T00:00:00.000Z',
      },
      {
        productVariantId: 'variant-m',
        soldUnits: '12',
        revenue: '15000',
        lastSoldAt: '2025-12-15T00:00:00.000Z',
      },
    ]);

    jest.useFakeTimers().setSystemTime(new Date('2026-03-06T00:00:00.000Z'));

    try {
      const report = await service.getStockReport({
        staleAfterDays: 30,
        lowStockThreshold: 5,
        topLimit: 5,
      });

      expect(report.summary.totalProducts).toBe(3);
      expect(report.summary.totalUnitsInStock).toBe(7);
      expect(report.summary.lowStockProducts).toBe(2);
      expect(report.summary.stockSetupPendingProducts).toBe(1);
      expect(report.summary.staleProducts).toBe(2);
      expect(report.highlights.topSelling[0].productId).toBe('variant-product');
      expect(report.highlights.lowStockProducts[0].productId).toBe(
        'simple-product',
      );
      expect(report.highlights.staleProducts[0].productId).toBe(
        'pending-stock',
      );

      const variantProduct = report.inventory.find(
        (item) => item.productId === 'variant-product',
      );

      expect(variantProduct).toMatchObject({
        totalStock: 5,
        stockStatus: 'low-stock',
        soldUnits: 40,
        movementStatus: 'best-selling',
      });
      expect(variantProduct?.stockBreakdown).toHaveLength(2);
    } finally {
      jest.useRealTimers();
    }
  });
});
