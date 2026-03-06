import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Not, Repository } from 'typeorm';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { CouponQueryDto } from './dto/coupon-query.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { Coupon, CouponType } from './entities/coupon.entity';

export type AppliedCouponPreview = {
  id: string;
  code: string;
  type: CouponType;
  amount: number;
  discountAmount: number;
};

@Injectable()
export class CouponService {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
  ) {}

  async create(createCouponDto: CreateCouponDto) {
    const normalizedCode = this.normalizeCode(createCouponDto.code);

    const exists = await this.couponRepository.exist({
      where: { code: normalizedCode },
    });

    if (exists) {
      throw new ConflictException('Coupon code already exists');
    }

    this.validateCouponInput(createCouponDto.type, createCouponDto.amount);

    const coupon = this.couponRepository.create({
      code: normalizedCode,
      type: createCouponDto.type,
      amount: createCouponDto.amount,
      minOrderTotal: createCouponDto.minOrderTotal ?? null,
      usageLimit: createCouponDto.usageLimit ?? null,
      expiresAt: createCouponDto.expiresAt
        ? new Date(createCouponDto.expiresAt)
        : null,
      note: createCouponDto.note?.trim() || null,
      isActive: createCouponDto.isActive ?? true,
    });

    return this.couponRepository.save(coupon);
  }

  async findAll(query: CouponQueryDto) {
    const normalizedCode = query.code ? this.normalizeCode(query.code) : null;

    if (query.couponId || normalizedCode) {
      const coupon = await this.couponRepository.findOne({
        where: query.couponId
          ? { id: query.couponId }
          : { code: normalizedCode as string },
      });

      if (!coupon) {
        throw new NotFoundException('Coupon not found');
      }

      return {
        mode: 'single',
        data: coupon,
      };
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const search = query.search?.trim();

    const qb = this.couponRepository
      .createQueryBuilder('coupon')
      .orderBy('coupon.createdAt', 'DESC');

    if (search) {
      qb.andWhere(
        new Brackets((subQb) => {
          subQb
            .where('coupon.code ILIKE :search', { search: `%${search}%` })
            .orWhere('coupon.note ILIKE :search', { search: `%${search}%` });
        }),
      );
    }

    if (typeof query.isActive === 'boolean') {
      qb.andWhere('coupon.isActive = :isActive', {
        isActive: query.isActive,
      });
    }

    qb.skip((page - 1) * limit).take(limit);

    const [coupons, total] = await qb.getManyAndCount();

    return {
      mode: 'list',
      data: coupons,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(updateCouponDto: UpdateCouponDto) {
    const coupon = await this.couponRepository.findOne({
      where: {
        id: updateCouponDto.couponId,
      },
    });

    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    if (updateCouponDto.code !== undefined) {
      const normalizedCode = this.normalizeCode(updateCouponDto.code);

      const exists = await this.couponRepository.exist({
        where: {
          code: normalizedCode,
          id: Not(coupon.id),
        },
      });

      if (exists) {
        throw new ConflictException('Coupon code already exists');
      }

      coupon.code = normalizedCode;
    }

    const nextType = updateCouponDto.type ?? coupon.type;
    const nextAmount = updateCouponDto.amount ?? coupon.amount;
    this.validateCouponInput(nextType, nextAmount);

    coupon.type = nextType;
    coupon.amount = nextAmount;

    if (updateCouponDto.minOrderTotal !== undefined) {
      coupon.minOrderTotal = updateCouponDto.minOrderTotal ?? null;
    }

    if (updateCouponDto.usageLimit !== undefined) {
      coupon.usageLimit = updateCouponDto.usageLimit ?? null;
    }

    if (updateCouponDto.expiresAt !== undefined) {
      coupon.expiresAt = updateCouponDto.expiresAt
        ? new Date(updateCouponDto.expiresAt)
        : null;
    }

    if (updateCouponDto.note !== undefined) {
      coupon.note = updateCouponDto.note?.trim() || null;
    }

    if (updateCouponDto.isActive !== undefined) {
      coupon.isActive = updateCouponDto.isActive;
    }

    return this.couponRepository.save(coupon);
  }

  async validateCoupon(
    code: string,
    subtotal: number,
  ): Promise<AppliedCouponPreview> {
    const normalizedCode = this.normalizeCode(code);

    const coupon = await this.couponRepository.findOne({
      where: {
        code: normalizedCode,
      },
    });

    if (!coupon) {
      throw new BadRequestException('Coupon code is not valid');
    }

    if (!coupon.isActive) {
      throw new BadRequestException('Coupon is inactive');
    }

    if (coupon.expiresAt && coupon.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('Coupon has expired');
    }

    if (
      typeof coupon.usageLimit === 'number' &&
      coupon.usedCount >= coupon.usageLimit
    ) {
      throw new BadRequestException('Coupon usage limit has been reached');
    }

    if (
      typeof coupon.minOrderTotal === 'number' &&
      subtotal < coupon.minOrderTotal
    ) {
      throw new BadRequestException(
        `Coupon requires a minimum order of ${coupon.minOrderTotal}`,
      );
    }

    const rawDiscount =
      coupon.type === CouponType.PERCENTAGE
        ? subtotal * (coupon.amount / 100)
        : coupon.amount;
    const discountAmount = this.roundCurrency(
      rawDiscount > subtotal ? subtotal : rawDiscount,
    );

    return {
      id: coupon.id,
      code: coupon.code,
      type: coupon.type,
      amount: coupon.amount,
      discountAmount,
    };
  }

  private normalizeCode(code: string) {
    const normalized = code.trim().toUpperCase();

    if (!normalized) {
      throw new BadRequestException('Coupon code is required');
    }

    return normalized;
  }

  private validateCouponInput(type: CouponType, amount: number) {
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestException('Coupon amount must be greater than zero');
    }

    if (type === CouponType.PERCENTAGE && amount > 100) {
      throw new BadRequestException(
        'Percentage coupon cannot be greater than 100',
      );
    }
  }

  private roundCurrency(value: number) {
    return Math.round(value * 100) / 100;
  }
}
