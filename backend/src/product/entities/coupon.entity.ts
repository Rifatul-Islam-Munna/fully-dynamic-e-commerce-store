import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { NumericTransformer } from './product.entity';

export enum CouponType {
  PERCENTAGE = 'percentage',
  VALUE = 'value',
}

@Entity('coupons')
@Index('idx_coupons_code', ['code'], { unique: true })
@Index('idx_coupons_is_active', ['isActive'])
@Index('idx_coupons_created_at', ['createdAt'])
export class Coupon {
  @ApiProperty({
    description: 'Unique coupon identifier',
    example: 'f4330c55-cc61-4fda-a9ff-61569b5f5df6',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Coupon code',
    example: 'EID10',
  })
  @Column({ type: 'varchar', length: 60, unique: true })
  code: string;

  @ApiProperty({
    description: 'Coupon discount type',
    enum: CouponType,
    example: CouponType.PERCENTAGE,
  })
  @Column({
    type: 'enum',
    enum: CouponType,
  })
  type: CouponType;

  @ApiProperty({
    description: 'Coupon value or percentage',
    example: 10,
  })
  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: NumericTransformer,
  })
  amount: number;

  @ApiPropertyOptional({
    description: 'Minimum subtotal required to use coupon',
    example: 1000,
  })
  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
    transformer: NumericTransformer,
  })
  minOrderTotal: number | null;

  @ApiPropertyOptional({
    description: 'Optional max usage count',
    example: 100,
  })
  @Column({ type: 'int', nullable: true })
  usageLimit: number | null;

  @ApiProperty({
    description: 'How many times the coupon has been used',
    example: 4,
    default: 0,
  })
  @Column({ type: 'int', default: 0 })
  usedCount: number;

  @ApiPropertyOptional({
    description: 'Expiration timestamp',
    example: '2026-12-31T23:59:59.000Z',
  })
  @Column({ type: 'timestamptz', nullable: true })
  expiresAt: Date | null;

  @ApiPropertyOptional({
    description: 'Optional admin note',
    example: 'Eid campaign coupon',
  })
  @Column({ type: 'varchar', length: 200, nullable: true })
  note: string | null;

  @ApiProperty({
    description: 'Whether coupon is active',
    example: true,
    default: true,
  })
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2026-03-06T13:15:00.000Z',
  })
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty({
    description: 'Update timestamp',
    example: '2026-03-06T13:15:00.000Z',
  })
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
