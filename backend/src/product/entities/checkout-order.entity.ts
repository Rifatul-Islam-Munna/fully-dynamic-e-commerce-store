import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Coupon, CouponType } from './coupon.entity';
import { NumericTransformer } from './product.entity';
import { CheckoutOrderItem } from './checkout-order-item.entity';

export enum CheckoutMode {
  GUEST = 'guest',
  MEMBER = 'member',
}

export enum CheckoutOrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
}

export enum CheckoutPaymentMethod {
  PLACE_ORDER = 'place_order',
  BKASH = 'bkash',
}

export enum CheckoutPaymentStatus {
  UNPAID = 'unpaid',
  PARTIAL_PAID = 'partial_paid',
  PAID = 'paid',
}

@Entity('checkout_orders')
@Index('idx_checkout_orders_order_number', ['orderNumber'], { unique: true })
@Index('idx_checkout_orders_user_id', ['userId'])
@Index('idx_checkout_orders_created_at', ['createdAt'])
export class CheckoutOrder {
  @ApiProperty({
    description: 'Unique checkout order identifier',
    example: '3dbd4130-d841-4638-b2f1-bf1857de6f57',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Human-friendly order reference',
    example: 'CHK-M7A8Z0-1X9A',
  })
  @Column({ type: 'varchar', length: 40, unique: true })
  orderNumber: string;

  @ApiPropertyOptional({
    description: 'User id for member checkout. Null for guest checkout.',
    example: '35f79af8-4d1f-4af6-a1ad-58446025c264',
  })
  @Column({ type: 'uuid', nullable: true })
  userId: string | null;

  @ApiProperty({
    description: 'Checkout mode',
    enum: CheckoutMode,
    example: CheckoutMode.GUEST,
  })
  @Column({
    type: 'enum',
    enum: CheckoutMode,
    default: CheckoutMode.GUEST,
  })
  checkoutMode: CheckoutMode;

  @ApiProperty({
    description: 'Current order lifecycle status',
    enum: CheckoutOrderStatus,
    example: CheckoutOrderStatus.PENDING,
  })
  @Column({
    type: 'enum',
    enum: CheckoutOrderStatus,
    default: CheckoutOrderStatus.PENDING,
  })
  status: CheckoutOrderStatus;

  @ApiPropertyOptional({
    description: 'Checkout email snapshot',
    example: 'customer@example.com',
  })
  @Column({ type: 'varchar', length: 160, nullable: true })
  customerEmail: string | null;

  @ApiProperty({
    description: 'Checkout phone number snapshot',
    example: '+8801700000000',
  })
  @Column({ type: 'varchar', length: 30 })
  customerPhoneNumber: string;

  @ApiProperty({
    description: 'Checkout district snapshot',
    example: 'Dhaka',
  })
  @Column({ type: 'varchar', length: 120 })
  customerDistrict: string;

  @ApiProperty({
    description: 'Checkout address snapshot',
    example: 'House 11, Road 7, Mirpur DOHS',
  })
  @Column({ type: 'varchar', length: 500 })
  customerAddress: string;

  @ApiProperty({
    description: 'Checkout payment method',
    enum: CheckoutPaymentMethod,
    example: CheckoutPaymentMethod.PLACE_ORDER,
  })
  @Column({
    type: 'enum',
    enum: CheckoutPaymentMethod,
    default: CheckoutPaymentMethod.PLACE_ORDER,
  })
  paymentMethod: CheckoutPaymentMethod;

  @ApiProperty({
    description: 'Payment settlement status snapshot',
    enum: CheckoutPaymentStatus,
    example: CheckoutPaymentStatus.UNPAID,
  })
  @Column({
    type: 'enum',
    enum: CheckoutPaymentStatus,
    default: CheckoutPaymentStatus.UNPAID,
  })
  paymentStatus: CheckoutPaymentStatus;

  @ApiProperty({
    description: 'Total quantity across all order lines',
    example: 3,
  })
  @Column({ type: 'int', default: 0 })
  itemCount: number;

  @ApiProperty({
    description: 'Subtotal captured at checkout time',
    example: 3580,
  })
  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: NumericTransformer,
  })
  subtotal: number;

  @ApiProperty({
    description: 'Discount amount applied by coupon',
    example: 358,
    default: 0,
  })
  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: NumericTransformer,
  })
  discountAmount: number;

  @ApiPropertyOptional({
    description: 'Applied coupon id',
    example: 'f4330c55-cc61-4fda-a9ff-61569b5f5df6',
  })
  @Column({ type: 'uuid', nullable: true })
  couponId: string | null;

  @ApiPropertyOptional({
    description: 'Applied coupon code snapshot',
    example: 'EID10',
  })
  @Column({ type: 'varchar', length: 60, nullable: true })
  couponCode: string | null;

  @ApiPropertyOptional({
    description: 'Applied coupon type snapshot',
    enum: CouponType,
    example: CouponType.PERCENTAGE,
  })
  @Column({
    type: 'enum',
    enum: CouponType,
    nullable: true,
  })
  couponType: CouponType | null;

  @ApiPropertyOptional({
    description: 'Applied coupon amount snapshot',
    example: 10,
  })
  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
    transformer: NumericTransformer,
  })
  couponAmount: number | null;

  @ApiProperty({
    description: 'Final payable total',
    example: 3580,
  })
  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: NumericTransformer,
  })
  total: number;

  @ApiProperty({
    description: 'Amount already captured from the customer',
    example: 300,
    default: 0,
  })
  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: NumericTransformer,
  })
  paidAmount: number;

  @ApiProperty({
    description: 'Remaining amount still due after any captured payment',
    example: 3280,
  })
  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: NumericTransformer,
  })
  dueAmount: number;

  @ApiPropertyOptional({
    description: 'Associated bKash payment id when the order used bKash',
    example: 'TR0011ABCDEF',
  })
  @Column({ type: 'varchar', length: 120, nullable: true })
  bkashPaymentId: string | null;

  @ApiPropertyOptional({
    description: 'Associated bKash transaction id when the order used bKash',
    example: '9A12BC34DE',
  })
  @Column({ type: 'varchar', length: 120, nullable: true })
  bkashTransactionId: string | null;

  @ManyToOne(() => User, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'userId' })
  user: User | null;

  @ManyToOne(() => Coupon, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'couponId' })
  coupon: Coupon | null;

  @ApiPropertyOptional({
    description: 'Submitted order line snapshots',
    type: () => [CheckoutOrderItem],
  })
  @OneToMany(() => CheckoutOrderItem, (item) => item.checkoutOrder, {
    cascade: false,
  })
  items: CheckoutOrderItem[];

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2026-03-06T13:15:00.000Z',
  })
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2026-03-06T13:15:00.000Z',
  })
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
