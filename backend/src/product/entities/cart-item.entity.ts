import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Product, NumericTransformer } from './product.entity';
import { ProductVariant } from './product-variant.entity';

@Entity('cart_items')
@Index('idx_cart_items_user_id', ['userId'])
@Index('idx_cart_items_user_created_at', ['userId', 'createdAt'])
@Index('idx_cart_items_unique_item', ['userId', 'productId', 'productVariantId'], {
  unique: true,
})
export class CartItem {
  @ApiProperty({
    description: 'Unique cart item identifier',
    example: '1147d1d9-6f26-4857-8e8e-57b3221d9700',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'User id who owns this cart item',
    example: '35f79af8-4d1f-4af6-a1ad-58446025c264',
  })
  @Column({ type: 'uuid' })
  userId: string;

  @ApiProperty({
    description: 'Product id',
    example: 'de1224d2-cd0b-4f91-8128-2ddb58dcfe18',
  })
  @Column({ type: 'uuid' })
  productId: string;

  @ApiPropertyOptional({
    description: 'Selected product variant id (null for simple products)',
    example: '42ce0bf1-4593-4c1e-bf0f-9af7fdfefe9e',
  })
  @Column({ type: 'uuid', nullable: true })
  productVariantId: string | null;

  @ApiProperty({
    description: 'Quantity in cart',
    example: 2,
  })
  @Column({ type: 'int', default: 1 })
  quantity: number;

  @ApiProperty({
    description: 'Captured unit price at add-to-cart time',
    example: 1590,
  })
  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: NumericTransformer,
  })
  unitPrice: number;

  @ApiPropertyOptional({
    description: 'Captured discounted unit price at add-to-cart time',
    example: 1390,
  })
  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
    transformer: NumericTransformer,
  })
  unitDiscountPrice: number | null;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Product, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @ManyToOne(() => ProductVariant, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'productVariantId' })
  productVariant: ProductVariant | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
