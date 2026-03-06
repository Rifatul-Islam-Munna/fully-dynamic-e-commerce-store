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
import { NumericTransformer, Product } from './product.entity';

@Entity('product_variants')
@Index('idx_product_variants_product_id', ['productId'])
@Index('idx_product_variants_sku', ['sku'], { unique: true })
export class ProductVariant {
  @ApiProperty({
    description: 'Unique product variant identifier',
    example: '42ce0bf1-4593-4c1e-bf0f-9af7fdfefe9e',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Parent product id',
    example: 'de1224d2-cd0b-4f91-8128-2ddb58dcfe18',
  })
  @Column({ type: 'uuid' })
  productId: string;

  @ApiProperty({
    description: 'Variant title',
    example: 'Size M / Black',
  })
  @Column({ type: 'varchar', length: 160 })
  title: string;

  @ApiPropertyOptional({
    description: 'Stock keeping unit',
    example: 'TSHIRT-BLK-M',
  })
  @Column({ type: 'varchar', length: 120, nullable: true, unique: true })
  sku: string | null;

  @ApiProperty({
    description: 'Variant price',
    example: 1590,
  })
  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: NumericTransformer,
  })
  price: number;

  @ApiPropertyOptional({
    description: 'Variant discounted price',
    example: 1390,
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
    description: 'Current stock',
    example: 25,
    default: 0,
  })
  @Column({ type: 'int', default: 0 })
  stock: number;

  @ApiPropertyOptional({
    description: 'Variant attributes as string array',
    example: ['M', 'Black'],
  })
  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  attributes: string[];

  @ApiProperty({
    description: 'Variant active status',
    example: true,
    default: true,
  })
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ApiProperty({
    description: 'Variant order for display',
    example: 1,
    default: 0,
  })
  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @ManyToOne(() => Product, (product) => product.variants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
