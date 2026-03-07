import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Brackets,
  DataSource,
  EntityManager,
  In,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { jwts } from '../../lib/auth.guard';
import { User, UserStatus } from '../user/entities/user.entity';
import { CartItem } from './entities/cart-item.entity';
import { Coupon, CouponType } from './entities/coupon.entity';
import { Product } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';
import {
  CheckoutPaymentMethod,
  CheckoutPaymentStatus,
  CheckoutOrderStatus,
  CheckoutMode,
  CheckoutOrder,
} from './entities/checkout-order.entity';
import { CheckoutOrderItem } from './entities/checkout-order-item.entity';
import {
  BkashCheckoutSession,
  BkashCheckoutSessionStatus,
} from './entities/bkash-checkout-session.entity';
import { CouponService } from './coupon.service';
import { AdminCheckoutQueryDto } from './dto/admin-checkout-query.dto';
import {
  CreateCheckoutDto,
  CreateCheckoutItemDto,
} from './dto/create-checkout.dto';
import { UpdateCheckoutOrderStatusDto } from './dto/update-checkout-order-status.dto';
import { BkashService } from './bkash.service';

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
  orderPayableAmount: number | null;
  lineTotal: number;
};

type CheckoutPricingPreview = {
  itemCount: number;
  subtotal: number;
  discountAmount: number;
  total: number;
  bkashPayableAmount: number;
  bkashDueAmount: number;
  coupon: {
    id: string;
    code: string;
    type: CouponType;
    amount: number;
    discountAmount: number;
  } | null;
};

type InventoryAdjustmentItem = {
  productId: string | null;
  productVariantId: string | null;
  quantity: number;
  productTitle: string;
};

type PreparedCheckout = {
  userId: string | null;
  checkoutMode: CheckoutMode;
  customerEmail: string | null;
  customerPhoneNumber: string;
  customerDistrict: string;
  customerAddress: string;
  resolvedItems: ResolvedCheckoutItem[];
  pricing: CheckoutPricingPreview;
};

type PersistCheckoutOrderOptions = {
  paymentMethod: CheckoutPaymentMethod;
  paymentStatus: CheckoutPaymentStatus;
  paidAmount: number;
  dueAmount: number;
  bkashPaymentId?: string | null;
  bkashTransactionId?: string | null;
  clearCartUserId?: string | null;
};

@Injectable()
export class CheckoutService {
  private logger = new Logger(CheckoutService.name);
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
    @InjectRepository(BkashCheckoutSession)
    private readonly bkashCheckoutSessionRepository: Repository<BkashCheckoutSession>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly couponService: CouponService,
    private readonly bkashService: BkashService,
  ) {}

  async create(createCheckoutDto: CreateCheckoutDto, accessToken?: string) {
    const currentUser = await this.resolveCurrentUser(accessToken);
    const preparedCheckout = await this.prepareCheckout(
      createCheckoutDto,
      currentUser,
    );

    return this.persistCheckoutOrder(preparedCheckout, {
      paymentMethod: CheckoutPaymentMethod.PLACE_ORDER,
      paymentStatus: CheckoutPaymentStatus.UNPAID,
      paidAmount: 0,
      dueAmount: preparedCheckout.pricing.total,
      clearCartUserId: currentUser?.id ?? null,
    });
  }

  async preview(items: CreateCheckoutItemDto[], couponCode?: string) {
    const resolvedItems = await this.resolveCheckoutItems(items);
    return this.buildPricingSummary(resolvedItems, couponCode);
  }

  async createPayment(
    createCheckoutDto: CreateCheckoutDto,
    accessToken?: string,
  ) {
    const currentUser = await this.resolveCurrentUser(accessToken);
    const preparedCheckout = await this.prepareCheckout(
      createCheckoutDto,
      currentUser,
    );

    if (preparedCheckout.pricing.bkashPayableAmount <= 0) {
      throw new BadRequestException(
        'bKash payable amount must be greater than zero',
      );
    }

    const merchantInvoiceNumber = await this.generateBkashInvoiceNumber();
    const session = await this.bkashCheckoutSessionRepository.save(
      this.bkashCheckoutSessionRepository.create({
        userId: preparedCheckout.userId,
        checkoutMode: preparedCheckout.checkoutMode,
        customerEmail: preparedCheckout.customerEmail,
        customerPhoneNumber: preparedCheckout.customerPhoneNumber,
        customerDistrict: preparedCheckout.customerDistrict,
        customerAddress: preparedCheckout.customerAddress,
        itemCount: preparedCheckout.pricing.itemCount,
        subtotal: preparedCheckout.pricing.subtotal,
        discountAmount: preparedCheckout.pricing.discountAmount,
        couponId: preparedCheckout.pricing.coupon?.id ?? null,
        couponCode: preparedCheckout.pricing.coupon?.code ?? null,
        couponType: preparedCheckout.pricing.coupon?.type ?? null,
        couponAmount: preparedCheckout.pricing.coupon?.amount ?? null,
        total: preparedCheckout.pricing.total,
        bkashPayableAmount: preparedCheckout.pricing.bkashPayableAmount,
        bkashDueAmount: preparedCheckout.pricing.bkashDueAmount,
        itemsSnapshot: preparedCheckout.resolvedItems,
        paymentId: null,
        merchantInvoiceNumber,
        status: BkashCheckoutSessionStatus.PENDING,
        orderId: null,
        transactionId: null,
        failureReason: null,
        finalizedAt: null,
      }),
    );

    try {
      const payment = await this.bkashService.createPayment({
        amount: preparedCheckout.pricing.bkashPayableAmount,
        payerReference:
          currentUser?.id ??
          preparedCheckout.customerPhoneNumber ??
          merchantInvoiceNumber,
        merchantInvoiceNumber,
        callbackUrl: this.buildBkashCallbackUrl(session.id),
      });

      session.paymentId = payment.paymentId;
      session.failureReason = null;
      await this.bkashCheckoutSessionRepository.save(session);

      return {
        ...payment,
        checkoutSessionId: session.id,
        payableAmount: preparedCheckout.pricing.bkashPayableAmount,
        dueAmount: preparedCheckout.pricing.bkashDueAmount,
      };
    } catch (error) {
      session.status = BkashCheckoutSessionStatus.FAILED;
      session.failureReason = this.getErrorMessage(error);
      await this.bkashCheckoutSessionRepository.save(session);
      throw error;
    }
  }

  async executePayment(
    checkoutSessionId: string,
    paymentId?: string,
    status?: string,
  ) {
    const session = await this.findBkashSessionOrThrow(checkoutSessionId);

    if (session.status === BkashCheckoutSessionStatus.COMPLETED && session.orderId) {
      const existingOrder = await this.findOrderOrThrow(session.orderId);
      return {
        success: true,
        order: existingOrder,
      };
    }

    if (status !== 'success') {
      session.status =
        status === 'cancel'
          ? BkashCheckoutSessionStatus.CANCELLED
          : BkashCheckoutSessionStatus.FAILED;
      session.failureReason = `bKash callback status: ${status ?? 'unknown'}`;
      await this.bkashCheckoutSessionRepository.save(session);

      return {
        success: false,
        reason: session.failureReason,
      };
    }

    if (!paymentId) {
      session.status = BkashCheckoutSessionStatus.FAILED;
      session.failureReason = 'Missing paymentID from bKash callback';
      await this.bkashCheckoutSessionRepository.save(session);

      return {
        success: false,
        reason: session.failureReason,
      };
    }

    try {
      const executePayment = await this.bkashService.executePayment(paymentId);
      this.logger.log('Execute response:', executePayment);
      const transactionStatus = this.toNullableText(
        executePayment.transactionStatus,
      );
      const transactionId =
        this.toNullableText(executePayment.trxID) ??
        this.toNullableText(executePayment.transactionId);

      const completedStatus =
        this.configService.get<string>('BKASH_COMPLETE')?.trim() || 'Completed';
      if (transactionStatus !== completedStatus) {
        session.status = BkashCheckoutSessionStatus.FAILED;
        session.failureReason =
          this.toNullableText(executePayment.statusMessage) ||
          transactionStatus ||
          'bKash payment was not completed';
        session.paymentId = paymentId;
        await this.bkashCheckoutSessionRepository.save(session);

        return {
          success: false,
          reason: session.failureReason,
        };
      }

      const order = await this.persistCheckoutOrderFromBkashSession(session, {
        paymentId,
        transactionId,
      });

      session.status = BkashCheckoutSessionStatus.COMPLETED;
      session.orderId = order.id;
      session.paymentId = paymentId;
      session.transactionId = transactionId;
      session.failureReason = null;
      session.finalizedAt = new Date();
      await this.bkashCheckoutSessionRepository.save(session);

      return {
        success: true,
        order,
      };
    } catch (error) {
      session.status = BkashCheckoutSessionStatus.FAILED;
      session.failureReason = this.getErrorMessage(error);
      session.paymentId = paymentId ?? session.paymentId;
      await this.bkashCheckoutSessionRepository.save(session);

      return {
        success: false,
        reason: session.failureReason,
      };
    }
  }

  async findAllAdmin(query: AdminCheckoutQueryDto) {
    if (query.orderId || query.orderNumber) {
      const order = await this.findOrderOrThrow(query.orderId, query.orderNumber);
      return {
        mode: 'single',
        data: order,
      };
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const baseQuery = this.checkoutOrderRepository.createQueryBuilder('order');
    this.applyAdminOrderFilters(baseQuery, query);

    const [total, idRows, summary] = await Promise.all([
      baseQuery.clone().getCount(),
      baseQuery
        .clone()
        .select('order.id', 'id')
        .orderBy('order.createdAt', 'DESC')
        .skip((page - 1) * limit)
        .take(limit)
        .getRawMany<{ id: string }>(),
      this.buildAdminSummary(),
    ]);

    const orderIds = idRows.map((row) => row.id);
    const orders =
      orderIds.length > 0
        ? await this.checkoutOrderRepository.find({
            where: {
              id: In(orderIds),
            },
            relations: {
              items: true,
            },
            order: {
              createdAt: 'DESC',
              items: {
                id: 'ASC',
              },
            },
          })
        : [];

    const orderMap = new Map(orders.map((order) => [order.id, order]));

    return {
      mode: 'list',
      data: orderIds
        .map((orderId) => orderMap.get(orderId))
        .filter((order): order is CheckoutOrder => Boolean(order)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      summary,
    };
  }

  async findMyOrders(userId: string) {
    const [rawSummary, recentOrders] = await Promise.all([
      this.checkoutOrderRepository
        .createQueryBuilder('order')
        .select('COUNT(*)', 'totalOrders')
        .addSelect(
          `COUNT(*) FILTER (WHERE order.status IN (:...activeStatuses))`,
          'activeOrders',
        )
        .addSelect(
          `COUNT(*) FILTER (WHERE order.status = :pendingStatus)`,
          'pendingOrders',
        )
        .addSelect(
          `COUNT(*) FILTER (WHERE order.status = :confirmedStatus)`,
          'confirmedOrders',
        )
        .addSelect(
          `COUNT(*) FILTER (WHERE order.status = :cancelledStatus)`,
          'cancelledOrders',
        )
        .addSelect('COALESCE(SUM(order.itemCount), 0)', 'totalItems')
        .addSelect(
          `COALESCE(SUM(CASE WHEN order.status IN (:...activeStatuses) THEN order.total ELSE 0 END), 0)`,
          'activeValue',
        )
        .addSelect(
          `COALESCE(SUM(CASE WHEN order.status = :confirmedStatus THEN order.total ELSE 0 END), 0)`,
          'confirmedSpend',
        )
        .addSelect('MAX(order.createdAt)', 'lastOrderAt')
        .where('order.userId = :userId', { userId })
        .setParameters({
          activeStatuses: [
            CheckoutOrderStatus.PENDING,
            CheckoutOrderStatus.CONFIRMED,
          ],
          pendingStatus: CheckoutOrderStatus.PENDING,
          confirmedStatus: CheckoutOrderStatus.CONFIRMED,
          cancelledStatus: CheckoutOrderStatus.CANCELLED,
        })
        .getRawOne<{
          totalOrders: string;
          activeOrders: string;
          pendingOrders: string;
          confirmedOrders: string;
          cancelledOrders: string;
          totalItems: string;
          activeValue: string;
          confirmedSpend: string;
          lastOrderAt: string | null;
        }>(),
      this.checkoutOrderRepository.find({
        where: {
          userId,
        },
        relations: {
          items: true,
        },
        order: {
          createdAt: 'DESC',
          items: {
            id: 'ASC',
          },
        },
        take: 6,
      }),
    ]);

    const recentOrderCards = recentOrders.map((order) => {
      const firstItem = order.items[0] ?? null;

      return {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        itemCount: order.itemCount,
        total: order.total,
        customerDistrict: order.customerDistrict,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
        firstItem: firstItem
          ? {
              productTitle: firstItem.productTitle,
              productSlug: firstItem.productSlug,
              productThumbnailUrl: firstItem.productThumbnailUrl,
              variantTitle: firstItem.variantTitle,
              quantity: firstItem.quantity,
            }
          : null,
      };
    });

    return {
      summary: {
        totalOrders: this.toNumber(rawSummary?.totalOrders),
        activeOrders: this.toNumber(rawSummary?.activeOrders),
        pendingOrders: this.toNumber(rawSummary?.pendingOrders),
        confirmedOrders: this.toNumber(rawSummary?.confirmedOrders),
        cancelledOrders: this.toNumber(rawSummary?.cancelledOrders),
        totalItems: this.toNumber(rawSummary?.totalItems),
        activeValue: this.roundCurrency(this.toNumber(rawSummary?.activeValue)),
        confirmedSpend: this.roundCurrency(
          this.toNumber(rawSummary?.confirmedSpend),
        ),
        lastOrderAt: rawSummary?.lastOrderAt ?? null,
      },
      activeOrders: recentOrderCards.filter(
        (order) => order.status !== CheckoutOrderStatus.CANCELLED,
      ),
      recentOrders: recentOrderCards,
    };
  }

  async updateStatus(updateCheckoutOrderStatusDto: UpdateCheckoutOrderStatusDto) {
    const updatedOrderId = await this.dataSource.transaction(async (manager) => {
      const checkoutOrderRepository = manager.getRepository(CheckoutOrder);
      const couponRepository = manager.getRepository(Coupon);
      const order = await checkoutOrderRepository.findOne({
        where: {
          id: updateCheckoutOrderStatusDto.orderId,
        },
        relations: {
          items: true,
        },
        order: {
          items: {
            id: 'ASC',
          },
        },
      });

      if (!order) {
        throw new NotFoundException('Checkout order not found');
      }

      if (order.status === updateCheckoutOrderStatusDto.status) {
        return order.id;
      }

      if (
        order.status === CheckoutOrderStatus.CANCELLED &&
        updateCheckoutOrderStatusDto.status !== CheckoutOrderStatus.CANCELLED
      ) {
        throw new BadRequestException(
          'Cancelled orders cannot be moved back to pending or confirmed',
        );
      }

      if (updateCheckoutOrderStatusDto.status === CheckoutOrderStatus.CANCELLED) {
        await this.adjustInventory(
          order.items.map((item) => ({
            productId: item.productId,
            productVariantId: item.productVariantId,
            quantity: item.quantity,
            productTitle: item.productTitle,
          })),
          'increase',
          manager,
        );

        if (order.couponId) {
          await couponRepository.decrement({ id: order.couponId }, 'usedCount', 1);
        }
      }

      order.status = updateCheckoutOrderStatusDto.status;
      await checkoutOrderRepository.save(order);

      return order.id;
    });

    return this.findOrderOrThrow(updatedOrderId);
  }

  private async prepareCheckout(
    createCheckoutDto: CreateCheckoutDto,
    currentUser: User | null,
  ): Promise<PreparedCheckout> {
    const customerPhoneNumber = this.requireText(
      createCheckoutDto.phoneNumber,
      'phoneNumber',
    );
    const customerDistrict = this.requireText(
      createCheckoutDto.district,
      'district',
    );
    const customerAddress = this.requireText(
      createCheckoutDto.address,
      'address',
    );
    const customerEmail =
      this.normalizeEmail(createCheckoutDto.email) ??
      currentUser?.email?.toLowerCase() ??
      null;
    const resolvedItems = await this.resolveCheckoutItems(createCheckoutDto.items);
    const pricing = await this.buildPricingSummary(
      resolvedItems,
      createCheckoutDto.couponCode,
    );

    return {
      userId: currentUser?.id ?? null,
      checkoutMode: currentUser ? CheckoutMode.MEMBER : CheckoutMode.GUEST,
      customerEmail,
      customerPhoneNumber,
      customerDistrict,
      customerAddress,
      resolvedItems,
      pricing,
    };
  }

  private async persistCheckoutOrderFromBkashSession(
    session: BkashCheckoutSession,
    paymentMeta: {
      paymentId: string;
      transactionId: string | null;
    },
  ) {
    const coupon =
      session.couponId &&
      session.couponCode &&
      session.couponType &&
      session.couponAmount !== null
        ? {
            id: session.couponId,
            code: session.couponCode,
            type: session.couponType,
            amount: session.couponAmount,
            discountAmount: session.discountAmount,
          }
        : null;

    return this.persistCheckoutOrder(
      {
        userId: session.userId,
        checkoutMode: session.checkoutMode,
        customerEmail: session.customerEmail,
        customerPhoneNumber: session.customerPhoneNumber,
        customerDistrict: session.customerDistrict,
        customerAddress: session.customerAddress,
        resolvedItems: session.itemsSnapshot as ResolvedCheckoutItem[],
        pricing: {
          itemCount: session.itemCount,
          subtotal: session.subtotal,
          discountAmount: session.discountAmount,
          total: session.total,
          bkashPayableAmount: session.bkashPayableAmount,
          bkashDueAmount: session.bkashDueAmount,
          coupon,
        },
      },
      {
        paymentMethod: CheckoutPaymentMethod.BKASH,
        paymentStatus:
          session.bkashDueAmount > 0
            ? CheckoutPaymentStatus.PARTIAL_PAID
            : CheckoutPaymentStatus.PAID,
        paidAmount: session.bkashPayableAmount,
        dueAmount: session.bkashDueAmount,
        bkashPaymentId: paymentMeta.paymentId,
        bkashTransactionId: paymentMeta.transactionId,
        clearCartUserId: session.userId,
      },
    );
  }

  private async persistCheckoutOrder(
    preparedCheckout: PreparedCheckout,
    options: PersistCheckoutOrderOptions,
  ) {
    const orderNumber = await this.generateOrderNumber();

    const savedOrder = await this.dataSource.transaction(async (manager) => {
      const checkoutOrderRepository = manager.getRepository(CheckoutOrder);
      const checkoutOrderItemRepository =
        manager.getRepository(CheckoutOrderItem);
      const cartRepository = manager.getRepository(CartItem);
      const couponRepository = manager.getRepository(Coupon);

      const checkoutOrder = checkoutOrderRepository.create({
        orderNumber,
        userId: preparedCheckout.userId,
        checkoutMode: preparedCheckout.checkoutMode,
        customerEmail: preparedCheckout.customerEmail,
        customerPhoneNumber: preparedCheckout.customerPhoneNumber,
        customerDistrict: preparedCheckout.customerDistrict,
        customerAddress: preparedCheckout.customerAddress,
        paymentMethod: options.paymentMethod,
        paymentStatus: options.paymentStatus,
        itemCount: preparedCheckout.pricing.itemCount,
        subtotal: preparedCheckout.pricing.subtotal,
        discountAmount: preparedCheckout.pricing.discountAmount,
        couponId: preparedCheckout.pricing.coupon?.id ?? null,
        couponCode: preparedCheckout.pricing.coupon?.code ?? null,
        couponType: preparedCheckout.pricing.coupon?.type ?? null,
        couponAmount: preparedCheckout.pricing.coupon?.amount ?? null,
        total: preparedCheckout.pricing.total,
        paidAmount: options.paidAmount,
        dueAmount: options.dueAmount,
        bkashPaymentId: options.bkashPaymentId ?? null,
        bkashTransactionId: options.bkashTransactionId ?? null,
      });

      const persistedOrder = await checkoutOrderRepository.save(checkoutOrder);

      const checkoutItems = checkoutOrderItemRepository.create(
        preparedCheckout.resolvedItems.map((item) => ({
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
      await this.adjustInventory(
        preparedCheckout.resolvedItems.map((item) => ({
          productId: item.productId,
          productVariantId: item.productVariantId,
          quantity: item.quantity,
          productTitle: item.productTitle,
        })),
        'decrease',
        manager,
      );

      if (preparedCheckout.pricing.coupon?.id) {
        await couponRepository.increment(
          { id: preparedCheckout.pricing.coupon.id },
          'usedCount',
          1,
        );
      }

      if (options.clearCartUserId) {
        await cartRepository.delete({
          userId: options.clearCartUserId,
        });
      }

      return persistedOrder;
    });

    return this.findOrderOrThrow(savedOrder.id);
  }

  private async findBkashSessionOrThrow(checkoutSessionId: string) {
    const session = await this.bkashCheckoutSessionRepository.findOne({
      where: {
        id: checkoutSessionId,
      },
    });

    if (!session) {
      throw new NotFoundException('bKash checkout session not found');
    }

    return session;
  }

  private buildBkashCallbackUrl(checkoutSessionId: string) {
    const backendUrl = this.requireConfigValue('BACKEND_URL');
    const baseUrl = backendUrl.replace(/\/+$/, '');
    return `${baseUrl}/product/checkout/execute-payment-callback?checkoutSessionId=${encodeURIComponent(
      checkoutSessionId,
    )}`;
  }

  private requireConfigValue(key: string) {
    const value = this.configService.get<string>(key)?.trim();
    if (!value) {
      throw new BadRequestException(`${key} is not configured`);
    }

    return value;
  }

  private getErrorMessage(error: unknown) {
    if (error instanceof Error && error.message.trim()) {
      return error.message;
    }

    return 'Unknown payment error';
  }

  private applyAdminOrderFilters(
    qb: SelectQueryBuilder<CheckoutOrder>,
    query: AdminCheckoutQueryDto,
  ) {
    if (query.status) {
      qb.andWhere('order.status = :status', {
        status: query.status,
      });
    }

    if (query.checkoutMode) {
      qb.andWhere('order.checkoutMode = :checkoutMode', {
        checkoutMode: query.checkoutMode,
      });
    }

    const search = query.search?.trim();
    if (search) {
      qb.andWhere(
        new Brackets((subQb) => {
          subQb
            .where('order.orderNumber ILIKE :search', {
              search: `%${search}%`,
            })
            .orWhere('order.customerPhoneNumber ILIKE :search', {
              search: `%${search}%`,
            })
            .orWhere('order.customerEmail ILIKE :search', {
              search: `%${search}%`,
            })
            .orWhere('order.customerDistrict ILIKE :search', {
              search: `%${search}%`,
            })
            .orWhere('order.customerAddress ILIKE :search', {
              search: `%${search}%`,
            });
        }),
      );
    }
  }

  private async buildAdminSummary() {
    const rawSummary = await this.checkoutOrderRepository
      .createQueryBuilder('order')
      .select('COUNT(*)', 'totalOrders')
      .addSelect(
        `COUNT(*) FILTER (WHERE order.status = :pendingStatus)`,
        'pendingOrders',
      )
      .addSelect(
        `COUNT(*) FILTER (WHERE order.status = :confirmedStatus)`,
        'confirmedOrders',
      )
      .addSelect(
        `COUNT(*) FILTER (WHERE order.status = :cancelledStatus)`,
        'cancelledOrders',
      )
      .addSelect(
        `COUNT(*) FILTER (WHERE order.checkoutMode = :guestMode)`,
        'guestOrders',
      )
      .addSelect(
        `COUNT(*) FILTER (WHERE order.checkoutMode = :memberMode)`,
        'memberOrders',
      )
      .addSelect(
        `COALESCE(SUM(CASE WHEN order.status = :confirmedStatus THEN order.total ELSE 0 END), 0)`,
        'confirmedRevenue',
      )
      .addSelect(
        `COALESCE(SUM(CASE WHEN order.status = :confirmedStatus THEN order.itemCount ELSE 0 END), 0)`,
        'confirmedUnits',
      )
      .setParameters({
        pendingStatus: CheckoutOrderStatus.PENDING,
        confirmedStatus: CheckoutOrderStatus.CONFIRMED,
        cancelledStatus: CheckoutOrderStatus.CANCELLED,
        guestMode: CheckoutMode.GUEST,
        memberMode: CheckoutMode.MEMBER,
      })
      .getRawOne<{
        totalOrders: string;
        pendingOrders: string;
        confirmedOrders: string;
        cancelledOrders: string;
        guestOrders: string;
        memberOrders: string;
        confirmedRevenue: string;
        confirmedUnits: string;
      }>();

    return {
      totalOrders: this.toNumber(rawSummary?.totalOrders),
      pendingOrders: this.toNumber(rawSummary?.pendingOrders),
      confirmedOrders: this.toNumber(rawSummary?.confirmedOrders),
      cancelledOrders: this.toNumber(rawSummary?.cancelledOrders),
      guestOrders: this.toNumber(rawSummary?.guestOrders),
      memberOrders: this.toNumber(rawSummary?.memberOrders),
      confirmedRevenue: this.roundCurrency(
        this.toNumber(rawSummary?.confirmedRevenue),
      ),
      confirmedUnits: this.toNumber(rawSummary?.confirmedUnits),
    };
  }

  private async findOrderOrThrow(orderId?: string, orderNumber?: string) {
    const normalizedOrderNumber = orderNumber?.trim();

    const order = await this.checkoutOrderRepository.findOne({
      where: orderId
        ? { id: orderId }
        : { orderNumber: normalizedOrderNumber as string },
      relations: {
        items: true,
      },
      order: {
        items: {
          id: 'ASC',
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Checkout order not found');
    }

    return order;
  }

  private async adjustInventory(
    items: InventoryAdjustmentItem[],
    direction: 'decrease' | 'increase',
    manager: EntityManager,
  ) {
    const productRepository = manager.getRepository(Product);
    const variantRepository = manager.getRepository(ProductVariant);

    for (const item of items) {
      if (item.productVariantId) {
        const variant = await variantRepository.findOne({
          where: {
            id: item.productVariantId,
          },
        });

        if (!variant) {
          if (direction === 'increase') {
            continue;
          }
          throw new NotFoundException('Variant not found during checkout');
        }

        if (direction === 'decrease') {
          if (variant.stock < item.quantity) {
            throw new BadRequestException(
              `Requested quantity exceeds stock for ${item.productTitle}`,
            );
          }

          variant.stock -= item.quantity;
        } else {
          variant.stock += item.quantity;
        }

        await variantRepository.save(variant);
        continue;
      }

      if (!item.productId) {
        continue;
      }

      const product = await productRepository.findOne({
        where: {
          id: item.productId,
        },
      });

      if (!product) {
        if (direction === 'increase') {
          continue;
        }
        throw new NotFoundException('Product not found during checkout');
      }

      if (product.stock === null) {
        continue;
      }

      if (direction === 'decrease') {
        if (product.stock < item.quantity) {
          throw new BadRequestException(
            `Requested quantity exceeds stock for ${item.productTitle}`,
          );
        }

        product.stock -= item.quantity;
      } else {
        product.stock += item.quantity;
      }

      await productRepository.save(product);
    }
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

      if (product.hasVariants) {
        if (!item.productVariantId) {
          throw new BadRequestException(
            'Variant product requires productVariantId in checkout request',
          );
        }

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
      } else if (product.stock !== null && product.stock < item.quantity) {
        throw new BadRequestException(
          `Requested quantity exceeds stock for ${product.title}`,
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
        orderPayableAmount: product.orderPayableAmount,
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
    const bkashPayableAmount = this.roundCurrency(
      Math.min(
        total,
        resolvedItems.reduce((runningTotal, item) => {
          const effectiveUnitPrice = item.unitDiscountPrice ?? item.unitPrice;
          const payableUnitPrice =
            item.orderPayableAmount !== null
              ? Math.min(item.orderPayableAmount, effectiveUnitPrice)
              : effectiveUnitPrice;

          return runningTotal + payableUnitPrice * item.quantity;
        }, 0),
      ),
    );
    const bkashDueAmount = this.roundCurrency(
      Math.max(0, total - bkashPayableAmount),
    );

    return {
      itemCount,
      subtotal,
      discountAmount,
      total,
      bkashPayableAmount,
      bkashDueAmount,
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

  private toNullableText(value: unknown) {
    if (typeof value !== 'string') {
      return null;
    }

    const normalized = value.trim();
    return normalized ? normalized : null;
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

  private async generateBkashInvoiceNumber() {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const merchantInvoiceNumber = `BKS-${Date.now()
        .toString(36)
        .toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

      const exists = await this.bkashCheckoutSessionRepository.exist({
        where: {
          merchantInvoiceNumber,
        },
      });

      if (!exists) {
        return merchantInvoiceNumber;
      }
    }

    throw new BadRequestException(
      'Could not generate a unique bKash invoice number',
    );
  }
}
