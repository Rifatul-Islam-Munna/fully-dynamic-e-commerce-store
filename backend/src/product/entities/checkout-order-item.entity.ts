import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { NumericTransformer, Product } from './product.entity';
import { ProductVariant } from './product-variant.entity';
import { CheckoutOrder } from './checkout-order.entity';

@Entity('checkout_order_items')
@Index('idx_checkout_order_items_order_id', ['checkoutOrderId'])
export class CheckoutOrderItem {
  @ApiProperty({
    description: 'Unique checkout order item identifier',
    example: '26bef0d6-db3b-4546-b647-a45b8b2a9f30',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Parent checkout order id',
    example: '3dbd4130-d841-4638-b2f1-bf1857de6f57',
  })
  @Column({ type: 'uuid' })
  checkoutOrderId: string;

  @ApiPropertyOptional({
    description: 'Snapshot product id reference',
    example: 'de1224d2-cd0b-4f91-8128-2ddb58dcfe18',
  })
  @Column({ type: 'uuid', nullable: true })
  productId: string | null;

  @ApiPropertyOptional({
    description: 'Snapshot variant id reference',
    example: '42ce0bf1-4593-4c1e-bf0f-9af7fdfefe9e',
  })
  @Column({ type: 'uuid', nullable: true })
  productVariantId: string | null;

  @ApiProperty({
    description: 'Product title snapshot',
    example: 'Organic Honey',
  })
  @Column({ type: 'varchar', length: 220 })
  productTitle: string;

  @ApiProperty({
    description: 'Product slug snapshot',
    example: 'organic-honey',
  })
  @Column({ type: 'varchar', length: 260 })
  productSlug: string;

  @ApiProperty({
    description: 'Product thumbnail snapshot',
    example: 'https://cdn.example.com/products/organic-honey/thumb.jpg',
  })
  @Column({ type: 'varchar', length: 500 })
  productThumbnailUrl: string;

  @ApiPropertyOptional({
    description: 'Variant title snapshot when variant is selected',
    example: 'Size M / Black',
  })
  @Column({ type: 'varchar', length: 160, nullable: true })
  variantTitle: string | null;

  @ApiProperty({
    description: 'Purchased quantity',
    example: 2,
  })
  @Column({ type: 'int' })
  quantity: number;

  @ApiProperty({
    description: 'Captured regular unit price',
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
    description: 'Captured discounted unit price',
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

  @ApiProperty({
    description: 'Line total at checkout time',
    example: 2780,
  })
  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: NumericTransformer,
  })
  lineTotal: number;

  @ManyToOne(() => CheckoutOrder, (checkoutOrder) => checkoutOrder.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'checkoutOrderId' })
  checkoutOrder: CheckoutOrder;

  @ManyToOne(() => Product, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'productId' })
  product: Product | null;

  @ManyToOne(() => ProductVariant, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'productVariantId' })
  productVariant: ProductVariant | null;
}
