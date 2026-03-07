import { CouponType } from './coupon.entity';
import { CheckoutMode } from './checkout-order.entity';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { NumericTransformer } from './product.entity';

export type BkashCheckoutItemSnapshot = {
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

export enum BkashCheckoutSessionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

@Entity('bkash_checkout_sessions')
@Index('idx_bkash_checkout_sessions_payment_id', ['paymentId'], { unique: true })
@Index('idx_bkash_checkout_sessions_order_id', ['orderId'])
@Index('idx_bkash_checkout_sessions_created_at', ['createdAt'])
export class BkashCheckoutSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  userId: string | null;

  @Column({
    type: 'enum',
    enum: CheckoutMode,
    default: CheckoutMode.GUEST,
  })
  checkoutMode: CheckoutMode;

  @Column({ type: 'varchar', length: 160, nullable: true })
  customerEmail: string | null;

  @Column({ type: 'varchar', length: 30 })
  customerPhoneNumber: string;

  @Column({ type: 'varchar', length: 120 })
  customerDistrict: string;

  @Column({ type: 'varchar', length: 500 })
  customerAddress: string;

  @Column({ type: 'int', default: 0 })
  itemCount: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: NumericTransformer,
  })
  subtotal: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: NumericTransformer,
  })
  discountAmount: number;

  @Column({ type: 'uuid', nullable: true })
  couponId: string | null;

  @Column({ type: 'varchar', length: 60, nullable: true })
  couponCode: string | null;

  @Column({
    type: 'enum',
    enum: CouponType,
    nullable: true,
  })
  couponType: CouponType | null;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
    transformer: NumericTransformer,
  })
  couponAmount: number | null;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: NumericTransformer,
  })
  total: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: NumericTransformer,
  })
  bkashPayableAmount: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: NumericTransformer,
  })
  bkashDueAmount: number;

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  itemsSnapshot: BkashCheckoutItemSnapshot[];

  @Column({ type: 'varchar', length: 120, nullable: true, unique: true })
  paymentId: string | null;

  @Column({ type: 'varchar', length: 80, unique: true })
  merchantInvoiceNumber: string;

  @Column({
    type: 'enum',
    enum: BkashCheckoutSessionStatus,
    default: BkashCheckoutSessionStatus.PENDING,
  })
  status: BkashCheckoutSessionStatus;

  @Column({ type: 'uuid', nullable: true })
  orderId: string | null;

  @ApiPropertyOptional({
    description: 'bKash transaction id after execute',
    example: '9A12BC34DE',
  })
  @Column({ type: 'varchar', length: 120, nullable: true })
  transactionId: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  failureReason: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  finalizedAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
