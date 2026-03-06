import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { jwts } from '../../lib/auth.guard';
import { CreateProductDto } from './dto/create-product.dto';
import { DeleteProductQueryDto } from './dto/delete-product-query.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { StockReportQueryDto } from './dto/stock-report-query.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  CheckoutOrderStatus,
} from './entities/checkout-order.entity';
import { CheckoutOrderItem } from './entities/checkout-order-item.entity';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { Product, ProductKind } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';

type ProductSalesAggregate = {
  soldUnits: number;
  revenue: number;
  orderCount: number;
  lastSoldAt: Date | null;
};

type VariantSalesAggregate = {
  soldUnits: number;
  revenue: number;
  lastSoldAt: Date | null;
};

@Injectable()
export class ProductService implements OnModuleInit {
  private readonly logger = new Logger(ProductService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductVariant)
    private readonly variantRepository: Repository<ProductVariant>,
    @InjectRepository(CheckoutOrderItem)
    private readonly checkoutOrderItemRepository: Repository<CheckoutOrderItem>,
  ) {}

  async onModuleInit() {
    try {
      await this.productRepository.query(`
        CREATE INDEX IF NOT EXISTS idx_products_fts
        ON products
        USING GIN (
          to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE("richText", ''))
        );
      `);
    } catch (error) {
      this.logger.warn(
        `Could not create full-text index idx_products_fts: ${(error as Error).message}`,
      );
    }
  }

  async create(createProductDto: CreateProductDto) {
    const hasVariants = createProductDto.hasVariants ?? false;
    const variants = createProductDto.variants ?? [];
    const slugBase = this.normalizeSlug(createProductDto.slug ?? createProductDto.title);
    const slug = await this.makeUniqueSlug(slugBase);
    const imageUrls = this.normalizeStringArray(createProductDto.imageUrls);
    const mainNavUrl = createProductDto.mainNavUrl?.trim() ?? null;
    const subNavUrl = createProductDto.subNavUrl?.trim() || null;

    this.validateDiscountPrice(
      createProductDto.price,
      createProductDto.discountPrice ?? null,
      'Product',
    );
    this.validateVariantPayload(hasVariants, variants);
    this.validateNavPlacement(mainNavUrl, subNavUrl);

    const createdProductId = await this.productRepository.manager.transaction(
      async (manager) => {
        const productRepo = manager.getRepository(Product);
        const variantRepo = manager.getRepository(ProductVariant);

        const product = productRepo.create({
          thumbnailUrl: createProductDto.thumbnailUrl.trim(),
          imageUrls,
          title: createProductDto.title.trim(),
          slug,
          price: createProductDto.price,
          discountPrice: createProductDto.discountPrice ?? null,
          richText: createProductDto.richText,
          mainNavUrl,
          subNavUrl,
          hasVariants,
          stock: this.normalizeSimpleStock(hasVariants, createProductDto.stock),
          productKind: hasVariants ? ProductKind.VARIANT : ProductKind.SIMPLE,
          isActive: createProductDto.isActive ?? true,
          isHotSells: createProductDto.isHotSells ?? false,
          isWeeklySell: createProductDto.isWeeklySell ?? false,
          isSummerSell: createProductDto.isSummerSell ?? false,
          isWinterSell: createProductDto.isWinterSell ?? false,
          isBestSell: createProductDto.isBestSell ?? false,
        });

        const savedProduct = await productRepo.save(product);

        if (hasVariants && variants.length > 0) {
          const mappedVariants = variants.map((variantDto) =>
            this.mapVariantInput(variantDto, savedProduct.id),
          );
          await variantRepo.save(mappedVariants);
        }

        return savedProduct.id;
      },
    );

    return this.getSingleProduct(createdProductId, true);
  }

  async findAll(currentUser: jwts | null | undefined, query: ProductQueryDto) {
    const isAdmin = this.isAdmin(currentUser);

    if (query.productId || query.slug) {
      const product = await this.findSingleByQuery(query, isAdmin);
      return {
        mode: 'single',
        data: product,
      };
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const minPrice = query.minPrice;
    const maxPrice = query.maxPrice;

    if (
      minPrice !== undefined &&
      maxPrice !== undefined &&
      minPrice > maxPrice
    ) {
      throw new BadRequestException('minPrice cannot be greater than maxPrice');
    }

    const qb = this.productRepository
      .createQueryBuilder('product')
      .select([
        'product.id',
        'product.thumbnailUrl',
        'product.imageUrls',
        'product.title',
        'product.slug',
        'product.price',
        'product.discountPrice',
        'product.mainNavUrl',
        'product.subNavUrl',
        'product.productKind',
        'product.hasVariants',
        'product.stock',
        'product.isActive',
        'product.isHotSells',
        'product.isWeeklySell',
        'product.isSummerSell',
        'product.isWinterSell',
        'product.isBestSell',
        'product.createdAt',
        'product.updatedAt',
      ])
      .skip((page - 1) * limit)
      .take(limit);

    if (!isAdmin) {
      qb.andWhere('product.isActive = true');
    } else if (query.isActive !== undefined) {
      qb.andWhere('product.isActive = :isActive', { isActive: query.isActive });
    }

    this.applyBooleanFilter(qb, 'product.isHotSells', query.isHotSells, 'isHotSells');
    this.applyBooleanFilter(
      qb,
      'product.isWeeklySell',
      query.isWeeklySell,
      'isWeeklySell',
    );
    this.applyBooleanFilter(
      qb,
      'product.isSummerSell',
      query.isSummerSell,
      'isSummerSell',
    );
    this.applyBooleanFilter(
      qb,
      'product.isWinterSell',
      query.isWinterSell,
      'isWinterSell',
    );
    this.applyBooleanFilter(qb, 'product.isBestSell', query.isBestSell, 'isBestSell');

    const search = query.search?.trim();
    if (search) {
      qb.andWhere(
        `
          to_tsvector('english', COALESCE(product.title, '') || ' ' || COALESCE(product."richText", ''))
          @@ websearch_to_tsquery('english', :search)
        `,
        { search },
      );
    }

    const mainNavUrl = query.mainNavUrl?.trim();
    if (mainNavUrl) {
      qb.andWhere('product.mainNavUrl = :mainNavUrl', { mainNavUrl });
    }

    const subNavUrl = query.subNavUrl?.trim();
    if (subNavUrl) {
      qb.andWhere('product.subNavUrl = :subNavUrl', { subNavUrl });
    }

    if (minPrice !== undefined) {
      qb.andWhere('COALESCE(product.discountPrice, product.price) >= :minPrice', {
        minPrice,
      });
    }

    if (maxPrice !== undefined) {
      qb.andWhere('COALESCE(product.discountPrice, product.price) <= :maxPrice', {
        maxPrice,
      });
    }

    this.applySort(qb, query.sort);

    const [products, total] = await qb.getManyAndCount();

    return {
      mode: 'list',
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(updateProductDto: UpdateProductDto) {
    const product = await this.productRepository.findOne({
      where: { id: updateProductDto.productId },
      relations: {
        variants: true,
      },
      order: {
        variants: {
          sortOrder: 'ASC',
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (updateProductDto.thumbnailUrl !== undefined) {
      product.thumbnailUrl = updateProductDto.thumbnailUrl.trim();
    }
    if (updateProductDto.imageUrls !== undefined) {
      product.imageUrls = this.normalizeStringArray(updateProductDto.imageUrls);
    }
    if (updateProductDto.title !== undefined) {
      product.title = updateProductDto.title.trim();
    }
    if (updateProductDto.price !== undefined) {
      product.price = updateProductDto.price;
    }
    if (updateProductDto.discountPrice !== undefined) {
      product.discountPrice = updateProductDto.discountPrice ?? null;
    }
    if (updateProductDto.richText !== undefined) {
      product.richText = updateProductDto.richText;
    }
    if (updateProductDto.mainNavUrl !== undefined) {
      product.mainNavUrl = updateProductDto.mainNavUrl.trim() || null;
    }
    if (updateProductDto.subNavUrl !== undefined) {
      product.subNavUrl = updateProductDto.subNavUrl.trim() || null;
    }
    if (updateProductDto.isActive !== undefined) {
      product.isActive = updateProductDto.isActive;
    }
    if (updateProductDto.isHotSells !== undefined) {
      product.isHotSells = updateProductDto.isHotSells;
    }
    if (updateProductDto.isWeeklySell !== undefined) {
      product.isWeeklySell = updateProductDto.isWeeklySell;
    }
    if (updateProductDto.isSummerSell !== undefined) {
      product.isSummerSell = updateProductDto.isSummerSell;
    }
    if (updateProductDto.isWinterSell !== undefined) {
      product.isWinterSell = updateProductDto.isWinterSell;
    }
    if (updateProductDto.isBestSell !== undefined) {
      product.isBestSell = updateProductDto.isBestSell;
    }

    const nextHasVariants = updateProductDto.hasVariants ?? product.hasVariants;
    const nextVariants = updateProductDto.variants;

    if (nextVariants !== undefined) {
      this.validateVariantPayload(nextHasVariants, nextVariants);
    } else if (updateProductDto.hasVariants === true && product.variants.length === 0) {
      throw new BadRequestException(
        'Provide variants when enabling hasVariants for a product',
      );
    }

    this.validateDiscountPrice(product.price, product.discountPrice, 'Product');
    this.validateNavPlacement(product.mainNavUrl, product.subNavUrl);

    const nextSlugBase = this.normalizeSlug(
      updateProductDto.slug ?? updateProductDto.title ?? product.slug,
    );
    product.slug = await this.makeUniqueSlug(nextSlugBase, product.id);
    product.hasVariants = nextHasVariants;
    if (nextHasVariants) {
      product.stock = null;
    } else if (updateProductDto.stock !== undefined) {
      product.stock = this.normalizeSimpleStock(false, updateProductDto.stock);
    }
    product.productKind = nextHasVariants ? ProductKind.VARIANT : ProductKind.SIMPLE;

    await this.productRepository.manager.transaction(async (manager) => {
      const productRepo = manager.getRepository(Product);
      const variantRepo = manager.getRepository(ProductVariant);

      await productRepo.save(product);

      if (!nextHasVariants) {
        await variantRepo.delete({ productId: product.id });
        return;
      }

      if (nextVariants !== undefined) {
        await variantRepo.delete({ productId: product.id });
        if (nextVariants.length > 0) {
          const mappedVariants = nextVariants.map((variantDto) =>
            this.mapVariantInput(variantDto, product.id),
          );
          await variantRepo.save(mappedVariants);
        }
      }
    });

    return this.getSingleProduct(product.id, true);
  }

  async remove(query: DeleteProductQueryDto) {
    const exists = await this.productRepository.exist({
      where: { id: query.productId },
    });

    if (!exists) {
      throw new NotFoundException('Product not found');
    }

    await this.productRepository.delete({ id: query.productId });

    return {
      deleted: true,
      productId: query.productId,
    };
  }

  async getStockReport(query: StockReportQueryDto) {
    const staleAfterDays = query.staleAfterDays ?? 30;
    const lowStockThreshold = query.lowStockThreshold ?? 5;
    const topLimit = query.topLimit ?? 8;
    const now = new Date();

    const [products, productSalesRows, variantSalesRows] = await Promise.all([
      this.productRepository.find({
        relations: {
          variants: true,
        },
        order: {
          createdAt: 'DESC',
          variants: {
            sortOrder: 'ASC',
          },
        },
      }),
      this.checkoutOrderItemRepository
        .createQueryBuilder('item')
        .innerJoin('item.checkoutOrder', 'order')
        .select('item.productId', 'productId')
        .addSelect('COALESCE(SUM(item.quantity), 0)', 'soldUnits')
        .addSelect('COALESCE(SUM(item.lineTotal), 0)', 'revenue')
        .addSelect('COUNT(DISTINCT order.id)', 'orderCount')
        .addSelect('MAX(order.createdAt)', 'lastSoldAt')
        .where('item.productId IS NOT NULL')
        .andWhere('order.status = :confirmedStatus', {
          confirmedStatus: CheckoutOrderStatus.CONFIRMED,
        })
        .groupBy('item.productId')
        .getRawMany<{
          productId: string;
          soldUnits: string;
          revenue: string;
          orderCount: string;
          lastSoldAt: string | null;
        }>(),
      this.checkoutOrderItemRepository
        .createQueryBuilder('item')
        .innerJoin('item.checkoutOrder', 'order')
        .select('item.productVariantId', 'productVariantId')
        .addSelect('COALESCE(SUM(item.quantity), 0)', 'soldUnits')
        .addSelect('COALESCE(SUM(item.lineTotal), 0)', 'revenue')
        .addSelect('MAX(order.createdAt)', 'lastSoldAt')
        .where('item.productVariantId IS NOT NULL')
        .andWhere('order.status = :confirmedStatus', {
          confirmedStatus: CheckoutOrderStatus.CONFIRMED,
        })
        .groupBy('item.productVariantId')
        .getRawMany<{
          productVariantId: string;
          soldUnits: string;
          revenue: string;
          lastSoldAt: string | null;
        }>(),
    ]);

    const productSales = new Map<string, ProductSalesAggregate>();
    for (const row of productSalesRows) {
      productSales.set(row.productId, {
        soldUnits: this.toNumber(row.soldUnits),
        revenue: this.roundCurrency(this.toNumber(row.revenue)),
        orderCount: this.toNumber(row.orderCount),
        lastSoldAt: this.toDateOrNull(row.lastSoldAt),
      });
    }

    const variantSales = new Map<string, VariantSalesAggregate>();
    for (const row of variantSalesRows) {
      variantSales.set(row.productVariantId, {
        soldUnits: this.toNumber(row.soldUnits),
        revenue: this.roundCurrency(this.toNumber(row.revenue)),
        lastSoldAt: this.toDateOrNull(row.lastSoldAt),
      });
    }

    const inventory = products.map((product) => {
      const productSalesEntry = productSales.get(product.id);
      const baseEffectivePrice = product.discountPrice ?? product.price;
      const totalStock = product.hasVariants
        ? product.variants.reduce((sum, variant) => sum + variant.stock, 0)
        : product.stock;
      const stockStatus =
        totalStock === null
          ? 'untracked'
          : totalStock <= 0
            ? 'out-of-stock'
            : totalStock <= lowStockThreshold
              ? 'low-stock'
              : 'healthy';
      const lastSoldAt = productSalesEntry?.lastSoldAt ?? null;
      const daysSinceLastSale = lastSoldAt
        ? this.diffInDays(lastSoldAt, now)
        : null;
      const daysInCatalog = this.diffInDays(product.createdAt, now);
      const isStale = lastSoldAt
        ? daysSinceLastSale !== null && daysSinceLastSale >= staleAfterDays
        : daysInCatalog >= staleAfterDays;
      const pricePoints = product.hasVariants
        ? product.variants.map(
            (variant) => variant.discountPrice ?? variant.price,
          )
        : [baseEffectivePrice];
      const minPrice = pricePoints.length > 0 ? Math.min(...pricePoints) : 0;
      const maxPrice = pricePoints.length > 0 ? Math.max(...pricePoints) : 0;
      const inventoryValue = product.hasVariants
        ? this.roundCurrency(
            product.variants.reduce(
              (sum, variant) =>
                sum + variant.stock * (variant.discountPrice ?? variant.price),
              0,
            ),
          )
        : totalStock === null
          ? null
          : this.roundCurrency(totalStock * baseEffectivePrice);

      return {
        productId: product.id,
        title: product.title,
        slug: product.slug,
        thumbnailUrl: product.thumbnailUrl,
        isActive: product.isActive,
        mainNavUrl: product.mainNavUrl,
        subNavUrl: product.subNavUrl,
        hasVariants: product.hasVariants,
        variantCount: product.variants.length,
        activeVariantCount: product.variants.filter((variant) => variant.isActive)
          .length,
        totalStock,
        stockStatus,
        stockTracked: totalStock !== null,
        soldUnits: productSalesEntry?.soldUnits ?? 0,
        revenue: productSalesEntry?.revenue ?? 0,
        orderCount: productSalesEntry?.orderCount ?? 0,
        lastSoldAt: lastSoldAt?.toISOString() ?? null,
        daysSinceLastSale,
        daysInCatalog,
        isStale,
        neverSold: !lastSoldAt,
        inventoryValue,
        priceRange: {
          min: minPrice,
          max: maxPrice,
        },
        movementStatus: this.getMovementStatus(
          productSalesEntry?.soldUnits ?? 0,
          isStale,
          daysInCatalog,
          staleAfterDays,
        ),
        stockBreakdown: product.variants.map((variant) => ({
          variantId: variant.id,
          title: variant.title,
          sku: variant.sku,
          stock: variant.stock,
          isActive: variant.isActive,
          soldUnits: variantSales.get(variant.id)?.soldUnits ?? 0,
          revenue: variantSales.get(variant.id)?.revenue ?? 0,
          lastSoldAt:
            variantSales.get(variant.id)?.lastSoldAt?.toISOString() ?? null,
        })),
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
      };
    });

    const topSelling = [...inventory]
      .filter((item) => item.soldUnits > 0)
      .sort((left, right) => {
        if (right.soldUnits !== left.soldUnits) {
          return right.soldUnits - left.soldUnits;
        }
        return right.revenue - left.revenue;
      })
      .slice(0, topLimit);

    const staleProducts = [...inventory]
      .filter((item) => item.isStale)
      .sort((left, right) => {
        if (left.neverSold !== right.neverSold) {
          return left.neverSold ? -1 : 1;
        }

        const rightDays = right.daysSinceLastSale ?? right.daysInCatalog;
        const leftDays = left.daysSinceLastSale ?? left.daysInCatalog;
        return rightDays - leftDays;
      })
      .slice(0, topLimit);

    const lowStockProducts = [...inventory]
      .filter(
        (item) =>
          item.stockStatus === 'out-of-stock' || item.stockStatus === 'low-stock',
      )
      .sort((left, right) => {
        if (left.stockStatus !== right.stockStatus) {
          return left.stockStatus === 'out-of-stock' ? -1 : 1;
        }

        return (left.totalStock ?? Number.MAX_SAFE_INTEGER) -
          (right.totalStock ?? Number.MAX_SAFE_INTEGER);
      })
      .slice(0, topLimit);

    const summary = {
      totalProducts: inventory.length,
      activeProducts: inventory.filter((item) => item.isActive).length,
      variantProducts: inventory.filter((item) => item.hasVariants).length,
      simpleProducts: inventory.filter((item) => !item.hasVariants).length,
      stockSetupPendingProducts: inventory.filter((item) => !item.stockTracked)
        .length,
      healthyStockProducts: inventory.filter(
        (item) => item.stockStatus === 'healthy',
      ).length,
      lowStockProducts: inventory.filter((item) => item.stockStatus === 'low-stock')
        .length,
      outOfStockProducts: inventory.filter(
        (item) => item.stockStatus === 'out-of-stock',
      ).length,
      staleProducts: inventory.filter((item) => item.isStale).length,
      neverSoldProducts: inventory.filter((item) => item.neverSold).length,
      totalUnitsInStock: inventory.reduce(
        (sum, item) => sum + (item.totalStock ?? 0),
        0,
      ),
      totalInventoryValue: this.roundCurrency(
        inventory.reduce((sum, item) => sum + (item.inventoryValue ?? 0), 0),
      ),
      totalSoldUnits: inventory.reduce((sum, item) => sum + item.soldUnits, 0),
      totalRevenue: this.roundCurrency(
        inventory.reduce((sum, item) => sum + item.revenue, 0),
      ),
    };

    return {
      generatedAt: now.toISOString(),
      thresholds: {
        staleAfterDays,
        lowStockThreshold,
        topLimit,
      },
      summary,
      highlights: {
        topSelling,
        staleProducts,
        lowStockProducts,
      },
      inventory,
    };
  }

  private async findSingleByQuery(query: ProductQueryDto, isAdmin: boolean) {
    const productId = query.productId;
    const slug = query.slug ? this.normalizeSlug(query.slug) : undefined;

    if (!productId && !slug) {
      throw new BadRequestException('Provide productId or slug for single mode');
    }

    const where = productId ? { id: productId } : { slug: slug as string };

    const product = await this.productRepository.findOne({
      where: isAdmin ? where : { ...where, isActive: true },
      relations: {
        variants: true,
      },
      order: {
        variants: {
          sortOrder: 'ASC',
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (!isAdmin) {
      product.variants = product.variants.filter((variant) => variant.isActive);
    }

    return product;
  }

  private async getSingleProduct(productId: string, isAdmin: boolean) {
    const product = await this.productRepository.findOne({
      where: isAdmin ? { id: productId } : { id: productId, isActive: true },
      relations: {
        variants: true,
      },
      order: {
        variants: {
          sortOrder: 'ASC',
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  private mapVariantInput(
    variantDto: CreateProductVariantDto,
    productId: string,
  ): Partial<ProductVariant> {
    this.validateDiscountPrice(
      variantDto.price,
      variantDto.discountPrice ?? null,
      `Variant "${variantDto.title}"`,
    );

    return {
      productId,
      title: variantDto.title.trim(),
      sku: variantDto.sku?.trim() || null,
      price: variantDto.price,
      discountPrice: variantDto.discountPrice ?? null,
      stock: variantDto.stock ?? 0,
      attributes: this.normalizeStringArray(variantDto.attributes),
      isActive: variantDto.isActive ?? true,
      sortOrder: variantDto.sortOrder ?? 0,
    };
  }

  private validateVariantPayload(
    hasVariants: boolean,
    variants: CreateProductVariantDto[],
  ) {
    if (hasVariants && variants.length === 0) {
      throw new BadRequestException(
        'Variants are required when hasVariants is true',
      );
    }

    if (!hasVariants && variants.length > 0) {
      throw new BadRequestException(
        'Do not pass variants when hasVariants is false',
      );
    }
  }

  private validateDiscountPrice(
    price: number,
    discountPrice: number | null,
    context: string,
  ) {
    if (discountPrice === null || discountPrice === undefined) {
      return;
    }

    if (discountPrice > price) {
      throw new BadRequestException(
        `${context} discountPrice cannot be greater than price`,
      );
    }
  }

  private validateNavPlacement(
    mainNavUrl: string | null | undefined,
    _subNavUrl: string | null | undefined,
  ) {
    if (!mainNavUrl) {
      throw new BadRequestException('mainNavUrl is required for every product');
    }
  }

  private normalizeSimpleStock(
    hasVariants: boolean,
    stock?: number | null,
  ): number | null {
    if (hasVariants) {
      return null;
    }

    if (stock === null || stock === undefined) {
      return 0;
    }

    return Math.max(0, Math.trunc(stock));
  }

  private toNumber(value: string | number | null | undefined) {
    if (typeof value === 'number') {
      return value;
    }

    if (typeof value === 'string' && value.trim()) {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : 0;
    }

    return 0;
  }

  private toDateOrNull(value: string | Date | null | undefined) {
    if (!value) {
      return null;
    }

    const nextDate = value instanceof Date ? value : new Date(value);
    return Number.isNaN(nextDate.getTime()) ? null : nextDate;
  }

  private diffInDays(from: Date, to: Date) {
    const milliseconds = to.getTime() - from.getTime();
    return Math.max(0, Math.floor(milliseconds / 86_400_000));
  }

  private getMovementStatus(
    soldUnits: number,
    isStale: boolean,
    daysInCatalog: number,
    staleAfterDays: number,
  ) {
    if (soldUnits <= 0) {
      return daysInCatalog >= staleAfterDays ? 'no-sales' : 'new';
    }

    if (soldUnits >= 25) {
      return 'best-selling';
    }

    if (isStale) {
      return 'slow';
    }

    return 'steady';
  }

  private roundCurrency(value: number) {
    return Math.round(value * 100) / 100;
  }

  private normalizeStringArray(values?: string[] | null) {
    if (!values || values.length === 0) {
      return [];
    }

    const seen = new Set<string>();
    const normalized: string[] = [];

    for (const raw of values) {
      const next = (raw ?? '').trim();
      if (!next || seen.has(next)) {
        continue;
      }
      seen.add(next);
      normalized.push(next);
    }

    return normalized;
  }

  private normalizeSlug(raw: string) {
    const cleaned = raw
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');

    return cleaned || `product-${Date.now()}`;
  }

  private async makeUniqueSlug(baseSlug: string, excludeProductId?: string) {
    let candidate = baseSlug;
    let suffix = 2;

    while (
      await this.productRepository
        .createQueryBuilder('product')
        .where('product.slug = :slug', { slug: candidate })
        .andWhere(
          excludeProductId ? 'product.id != :excludeProductId' : '1=1',
          excludeProductId ? { excludeProductId } : {},
        )
        .getExists()
    ) {
      candidate = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    return candidate;
  }

  private applyBooleanFilter(
    qb: SelectQueryBuilder<Product>,
    fieldName: string,
    value: boolean | undefined,
    paramName: string,
  ) {
    if (value === undefined) {
      return;
    }
    qb.andWhere(`${fieldName} = :${paramName}`, { [paramName]: value });
  }

  private applySort(
    qb: SelectQueryBuilder<Product>,
    sort?: 'newest' | 'price-asc' | 'price-desc' | 'title-asc',
  ) {
    switch (sort) {
      case 'price-asc':
        qb.orderBy('COALESCE(product.discountPrice, product.price)', 'ASC')
          .addOrderBy('product.createdAt', 'DESC');
        return;
      case 'price-desc':
        qb.orderBy('COALESCE(product.discountPrice, product.price)', 'DESC')
          .addOrderBy('product.createdAt', 'DESC');
        return;
      case 'title-asc':
        qb.orderBy('LOWER(product.title)', 'ASC').addOrderBy(
          'product.createdAt',
          'DESC',
        );
        return;
      default:
        qb.orderBy('product.createdAt', 'DESC');
    }
  }

  private isAdmin(currentUser?: jwts | null) {
    const role = currentUser?.role?.toLowerCase();
    return role === 'admin' || role === 'super_admin';
  }

  async findPublic(query: ProductQueryDto) {
    return this.findAll(undefined, query);
  }
}
