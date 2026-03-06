import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export const HOME_SECTION_TYPES = [
  'hero_slider',
  'product_collection',
  'discount_banner',
  'custom_banner',
] as const;

export type HomeSectionType = (typeof HOME_SECTION_TYPES)[number];

export const PRODUCT_FLAGS = [
  'isHotSells',
  'isWeeklySell',
  'isSummerSell',
  'isWinterSell',
  'isBestSell',
] as const;

export type ProductFlag = (typeof PRODUCT_FLAGS)[number];

export type HeroSlide = {
  title?: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  buttonLabel?: string;
  sortOrder?: number;
  isActive?: boolean;
};

export type HomeSection = {
  id: string;
  type: HomeSectionType;
  variant?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  backgroundImageUrl?: string;
  buttonLabel?: string;
  buttonUrl?: string;
  productFlag?: ProductFlag;
  mainNavUrl?: string;
  subNavUrl?: string;
  productLimit?: number;
  theme?: string;
  sortOrder?: number;
  isActive?: boolean;
  slides?: HeroSlide[];
};

@Entity('home_settings')
@Index('idx_home_settings_key', ['key'], { unique: true })
@Index('idx_home_settings_nav', ['mainNavUrl', 'subNavUrl'])
export class HomeSetting {
  @ApiProperty({
    description: 'Unique homepage settings identifier',
    example: '7d7ef387-6f88-4acc-b023-30d941c35d20',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Logical key for homepage settings',
    example: 'default',
    default: 'default',
  })
  @Column({ type: 'varchar', length: 80, unique: true, default: 'default' })
  key: string;

  @ApiPropertyOptional({
    description: 'Main navbar URL this page config belongs to. Null means global/homepage config.',
    example: '/shop',
  })
  @Column({ type: 'varchar', length: 300, nullable: true })
  mainNavUrl: string | null;

  @ApiPropertyOptional({
    description: 'Sub navbar URL this page config belongs to. Null means main page level only.',
    example: '/shop/men',
  })
  @Column({ type: 'varchar', length: 300, nullable: true })
  subNavUrl: string | null;

  @ApiPropertyOptional({
    description: 'Optional global visual theme token for homepage sections',
    example: 'warm-sand',
  })
  @Column({ type: 'varchar', length: 80, nullable: true })
  theme: string | null;

  @ApiProperty({
    description:
      'Ordered homepage sections. Supports hero slider, product collection, discount banner, and custom banner.',
    example: [
      {
        id: 'hero-main',
        type: 'hero_slider',
        title: 'Season Launch',
        sortOrder: 1,
        isActive: true,
        slides: [
          {
            title: 'New arrivals are here',
            imageUrl: 'https://cdn.example.com/home/hero-1.jpg',
            linkUrl: '/shop/new',
            buttonLabel: 'Shop Now',
            sortOrder: 1,
            isActive: true,
          },
        ],
      },
      {
        id: 'hot-week',
        type: 'product_collection',
        title: 'Hot This Week',
        productFlag: 'isHotSells',
        mainNavUrl: '/shop',
        productLimit: 8,
        sortOrder: 2,
      },
    ],
  })
  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  sections: HomeSection[];

  @ApiProperty({
    description: 'Whether this homepage config is active',
    example: true,
    default: true,
  })
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
