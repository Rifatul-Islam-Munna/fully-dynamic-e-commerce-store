import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { jwts } from '../../lib/auth.guard';
import { User, UserStatus } from '../user/entities/user.entity';
import { CartItem } from './entities/cart-item.entity';
import { Coupon, CouponType } from './entities/coupon.entity';
import { Product } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';
import {
  CheckoutMode,
  CheckoutOrder,
} from './entities/checkout-order.entity';
import { CheckoutOrderItem } from './entities/checkout-order-item.entity';
import { CouponService } from './coupon.service';
import {
  CreateCheckoutDto,
  CreateCheckoutItemDto,
} from './dto/create-checkout.dto';

type ResolvedCheckoutItem = {
  productId: string;
  productVariantId: string | null;
  productTitle: string;
  productSlug: string;
  productThumbnailUrl: string;
  variantTitle: string | null;
  quantity: number;
  unitPrice: number;
  unitDiscountPrice: number | null;
  lineTotal: number;
};

type CheckoutPricingPreview = {
  itemCount: number;
  subtotal: number;
  discountAmount: number;
  total: number;
  coupon: {
    id: string;
    code: string;
    type: CouponType;
    amount: number;
    discountAmount: number;
  } | null;
};

@Injectable()
export class CheckoutService {
  constructor(
    @InjectRepository(CheckoutOrder)
    private readonly checkoutOrderRepository: Repository<CheckoutOrder>,
    @InjectRepository(CheckoutOrderItem)
    private readonly checkoutOrderItemRepository: Repository<CheckoutOrderItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductVariant)
    private readonly variantRepository: Repository<ProductVariant>,
    @InjectRepository(CartItem)
    private readonly cartRepository: Repository<CartItem>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly couponService: CouponService,
  ) {}

  async create(createCheckoutDto: CreateCheckoutDto, accessToken?: string) {
    const currentUser = await this.resolveCurrentUser(accessToken);
    const phoneNumber = this.requireText(
      createCheckoutDto.phoneNumber,
      'phoneNumber',
    );
    const district = this.requireText(createCheckoutDto.district, 'district');
    const address = this.requireText(createCheckoutDto.address, 'address');
    const customerEmail =
      this.normalizeEmail(createCheckoutDto.email) ??
      currentUser?.email?.toLowerCase() ??
      null;

    const resolvedItems = await this.resolveCheckoutItems(createCheckoutDto.items);

    const pricing = await this.buildPricingSummary(
      resolvedItems,
      createCheckoutDto.couponCode,
    );
    const orderNumber = await this.generateOrderNumber();

    const savedOrder = await this.dataSource.transaction(async (manager) => {
      const checkoutOrderRepository = manager.getRepository(CheckoutOrder);
      const checkoutOrderItemRepository =
        manager.getRepository(CheckoutOrderItem);
      const cartRepository = manager.getRepository(CartItem);
      const couponRepository = manager.getRepository(Coupon);

      const checkoutOrder = checkoutOrderRepository.create({
        orderNumber,
        userId: currentUser?.id ?? null,
        checkoutMode: currentUser ? CheckoutMode.MEMBER : CheckoutMode.GUEST,
        customerEmail,
        customerPhoneNumber: phoneNumber,
        customerDistrict: district,
        customerAddress: address,
        itemCount: pricing.itemCount,
        subtotal: pricing.subtotal,
        discountAmount: pricing.discountAmount,
        couponId: pricing.coupon?.id ?? null,
        couponCode: pricing.coupon?.code ?? null,
        couponType: pricing.coupon?.type ?? null,
        couponAmount: pricing.coupon?.amount ?? null,
        total: pricing.total,
      });

      const persistedOrder = await checkoutOrderRepository.save(checkoutOrder);

      const checkoutItems = checkoutOrderItemRepository.create(
        resolvedItems.map((item) => ({
          checkoutOrderId: persistedOrder.id,
          productId: item.productId,
          productVariantId: item.productVariantId,
          productTitle: item.productTitle,
          productSlug: item.productSlug,
          productThumbnailUrl: item.productThumbnailUrl,
          variantTitle: item.variantTitle,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          unitDiscountPrice: item.unitDiscountPrice,
          lineTotal: item.lineTotal,
        })),
      );

      await checkoutOrderItemRepository.save(checkoutItems);

      if (pricing.coupon?.id) {
        await couponRepository.increment(
          { id: pricing.coupon.id },
          'usedCount',
          1,
        );
      }

      if (currentUser) {
        await cartRepository.delete({
          userId: currentUser.id,
        });
      }

      return persistedOrder;
    });

    const checkoutOrder = await this.checkoutOrderRepository.findOne({
      where: { id: savedOrder.id },
      relations: {
        items: true,
      },
      order: {
        items: {
          id: 'ASC',
        },
      },
    });

    if (!checkoutOrder) {
      throw new NotFoundException('Checkout order was created but not found');
    }

    return checkoutOrder;
  }

  async preview(items: CreateCheckoutItemDto[], couponCode?: string) {
    const resolvedItems = await this.resolveCheckoutItems(items);
    return this.buildPricingSummary(resolvedItems, couponCode);
  }

  private async resolveCheckoutItems(items: CreateCheckoutItemDto[]) {
    const mergedItems = new Map<
      string,
      { productId: string; productVariantId?: string; quantity: number }
    >();

    for (const item of items) {
      const key = `${item.productId}:${item.productVariantId ?? 'base'}`;
      const currentQuantity = Math.max(1, item.quantity ?? 1);
      const existing = mergedItems.get(key);

      if (existing) {
        existing.quantity += currentQuantity;
        continue;
      }

      mergedItems.set(key, {
        productId: item.productId,
        productVariantId: item.productVariantId,
        quantity: currentQuantity,
      });
    }

    const resolvedItems: ResolvedCheckoutItem[] = [];

    for (const item of mergedItems.values()) {
      const product = await this.productRepository.findOne({
        where: {
          id: item.productId,
          isActive: true,
        },
      });

      if (!product) {
        throw new NotFoundException('Product not found or inactive');
      }

      let productVariantId: string | null = null;
      let variantTitle: string | null = null;
      let unitPrice = product.price;
      let unitDiscountPrice = product.discountPrice;

      if (item.productVariantId) {
        const variant = await this.variantRepository.findOne({
          where: {
            id: item.productVariantId,
            productId: product.id,
            isActive: true,
          },
        });

        if (!variant) {
          throw new NotFoundException('Variant not found for this product');
        }

        if (variant.stock < item.quantity) {
          throw new BadRequestException(
            `Requested quantity exceeds stock for ${product.title}`,
          );
        }

        productVariantId = variant.id;
        variantTitle = variant.title;
        unitPrice = variant.price;
        unitDiscountPrice = variant.discountPrice;
      } else if (product.hasVariants) {
        throw new BadRequestException(
          'Variant product requires productVariantId in checkout request',
        );
      }

      const lineTotal = this.roundCurrency(
        (unitDiscountPrice ?? unitPrice) * item.quantity,
      );

      resolvedItems.push({
        productId: product.id,
        productVariantId,
        productTitle: product.title,
        productSlug: product.slug,
        productThumbnailUrl: product.thumbnailUrl,
        variantTitle,
        quantity: item.quantity,
        unitPrice,
        unitDiscountPrice,
        lineTotal,
      });
    }

    if (resolvedItems.length === 0) {
      throw new BadRequestException('At least one checkout item is required');
    }

    return resolvedItems;
  }

  private async buildPricingSummary(
    resolvedItems: ResolvedCheckoutItem[],
    couponCode?: string,
  ): Promise<CheckoutPricingPreview> {
    const itemCount = resolvedItems.reduce(
      (total, item) => total + item.quantity,
      0,
    );
    const subtotal = this.roundCurrency(
      resolvedItems.reduce((total, item) => total + item.lineTotal, 0),
    );
    const normalizedCouponCode = couponCode?.trim();
    const appliedCoupon = normalizedCouponCode
      ? await this.couponService.validateCoupon(normalizedCouponCode, subtotal)
      : null;
    const discountAmount = this.roundCurrency(
      appliedCoupon?.discountAmount ?? 0,
    );
    const total = this.roundCurrency(Math.max(0, subtotal - discountAmount));

    return {
      itemCount,
      subtotal,
      discountAmount,
      total,
      coupon: appliedCoupon,
    };
  }

  private async resolveCurrentUser(accessToken?: string) {
    if (!accessToken) {
      return null;
    }

    const secret = this.configService.get<string>('ACCESS_TOKEN');
    if (!secret) {
      throw new UnauthorizedException('ACCESS_TOKEN is not configured');
    }

    let decoded: jwts;

    try {
      decoded = await this.jwtService.verifyAsync<jwts>(accessToken, {
        secret,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const user = await this.userRepository.findOne({
      where: {
        id: decoded.id,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Authenticated user not found');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Authenticated user is not active');
    }

    return user;
  }

  private normalizeEmail(value?: string | null) {
    const normalized = value?.trim().toLowerCase();
    return normalized ? normalized : null;
  }

  private requireText(value: string | undefined, fieldName: string) {
    const normalized = value?.trim();
    if (!normalized) {
      throw new BadRequestException(`${fieldName} is required`);
    }

    return normalized;
  }

  private roundCurrency(value: number) {
    return Math.round(value * 100) / 100;
  }

  private async generateOrderNumber() {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const orderNumber = `CHK-${Date.now().toString(36).toUpperCase()}-${Math.random()
        .toString(36)
        .slice(2, 6)
        .toUpperCase()}`;

      const exists = await this.checkoutOrderRepository.exist({
        where: {
          orderNumber,
        },
      });

      if (!exists) {
        return orderNumber;
      }
    }

    throw new BadRequestException('Could not generate a unique order number');
  }
}
