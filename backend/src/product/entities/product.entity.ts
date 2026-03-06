import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProductVariant } from './product-variant.entity';

export const NumericTransformer = {
  to(value: number | null | undefined) {
    return value ?? null;
  },
  from(value: string | null) {
    return value === null ? null : Number(value);
  },
};

export enum ProductKind {
  SIMPLE = 'simple',
  VARIANT = 'variant',
}

@Entity('products')
@Index('idx_products_slug', ['slug'], { unique: true })
@Index('idx_products_created_at', ['createdAt'])
@Index('idx_products_main_nav_url', ['mainNavUrl'])
@Index('idx_products_sub_nav_url', ['subNavUrl'])
export class Product {
  @ApiProperty({
    description: 'Unique product identifier',
    example: 'de1224d2-cd0b-4f91-8128-2ddb58dcfe18',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Primary product thumbnail URL',
    example: 'https://cdn.example.com/products/organic-honey/thumb.jpg',
  })
  @Column({ type: 'varchar', length: 500 })
  thumbnailUrl: string;

  @ApiPropertyOptional({
    description: 'Additional product image URLs in display order',
    example: [
      'https://cdn.example.com/products/organic-honey/1.jpg',
      'https://cdn.example.com/products/organic-honey/2.jpg',
    ],
  })
  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  imageUrls: string[];

  @ApiProperty({
    description: 'Product title',
    example: 'Organic Honey',
  })
  @Column({ type: 'varchar', length: 220 })
  title: string;

  @ApiProperty({
    description: 'URL-friendly slug',
    example: 'organic-honey',
  })
  @Column({ type: 'varchar', length: 260, unique: true })
  slug: string;

  @ApiProperty({
    description: 'Base product price',
    example: 1200,
  })
  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: NumericTransformer,
  })
  price: number;

  @ApiPropertyOptional({
    description: 'Optional discounted price',
    example: 990,
  })
  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
    transformer: NumericTransformer,
  })
  discountPrice: number | null;

  @ApiProperty({
    description: 'Product rich text description',
    example: '<h2>Pure Organic Honey</h2><p>No chemical processing.</p>',
  })
  @Column({ type: 'text' })
  richText: string;

  @ApiProperty({
    description: 'Assigned navbar main item URL',
    example: '/shop',
  })
  @Column({ type: 'varchar', length: 300, nullable: true })
  mainNavUrl: string | null;

  @ApiPropertyOptional({
    description: 'Assigned navbar sub item URL',
    example: '/shop/honey',
  })
  @Column({ type: 'varchar', length: 300, nullable: true })
  subNavUrl: string | null;

  @ApiProperty({
    description: 'Product type (with variant / without variant)',
    enum: ProductKind,
    example: ProductKind.SIMPLE,
  })
  @Column({
    type: 'enum',
    enum: ProductKind,
    default: ProductKind.SIMPLE,
  })
  productKind: ProductKind;

  @ApiProperty({
    description: 'Whether this product has variants',
    example: false,
    default: false,
  })
  @Column({ type: 'boolean', default: false })
  hasVariants: boolean;

  @ApiProperty({
    description: 'Active status',
    example: true,
    default: true,
  })
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ApiProperty({
    description: 'Hot selling product flag',
    example: true,
    default: false,
  })
  @Column({ type: 'boolean', default: false })
  isHotSells: boolean;

  @ApiProperty({
    description: 'Weekly selling product flag',
    example: false,
    default: false,
  })
  @Column({ type: 'boolean', default: false })
  isWeeklySell: boolean;

  @ApiProperty({
    description: 'Summer selling product flag',
    example: false,
    default: false,
  })
  @Column({ type: 'boolean', default: false })
  isSummerSell: boolean;

  @ApiProperty({
    description: 'Winter selling product flag',
    example: true,
    default: false,
  })
  @Column({ type: 'boolean', default: false })
  isWinterSell: boolean;

  @ApiProperty({
    description: 'Best selling product flag',
    example: true,
    default: false,
  })
  @Column({ type: 'boolean', default: false })
  isBestSell: boolean;

  @ApiPropertyOptional({
    description: 'Variants list. Empty for non-variant products.',
    type: () => [ProductVariant],
  })
  @OneToMany(() => ProductVariant, (variant) => variant.product)
  variants: ProductVariant[];

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2026-03-05T10:00:00.000Z',
  })
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2026-03-05T10:05:00.000Z',
  })
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
