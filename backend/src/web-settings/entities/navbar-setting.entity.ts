import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type SubNavItem = {
  title: string;
  url: string;
  imageUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
};

export type MainNavItem = {
  title: string;
  url: string;
  imageUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
  subNav?: SubNavItem[];
};

@Entity('navbar_settings')
@Index('idx_navbar_settings_key', ['key'], { unique: true })
export class NavbarSetting {
  @ApiProperty({
    description: 'Unique navbar settings identifier',
    example: '43f4b750-52eb-42ca-964a-f29d5f68ff8e',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Logical key for navbar settings',
    example: 'default',
    default: 'default',
  })
  @Column({ type: 'varchar', length: 80, unique: true, default: 'default' })
  key: string;

  @ApiProperty({
    description: 'Array of main navigation items, each with optional subNav array',
    example: [
      {
        title: 'Shop',
        url: '/shop',
        imageUrl: null,
        sortOrder: 1,
        isActive: true,
        subNav: [
          {
            title: 'Men',
            url: '/shop/men',
            imageUrl: null,
            sortOrder: 1,
            isActive: true,
          },
        ],
      },
    ],
  })
  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  mainNav: MainNavItem[];

  @ApiProperty({
    description: 'Whether this navbar config is active',
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
