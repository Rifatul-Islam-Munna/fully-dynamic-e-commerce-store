import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type FooterSocialLink = {
  platform: string;
  url: string;
  imageUrl?: string;
};

export type FooterLink = {
  label: string;
  url: string;
  imageUrl?: string;
};

export type FooterSection = {
  title: string;
  links: FooterLink[];
};

@Entity('footer_settings')
@Index('idx_footer_settings_key', ['key'], { unique: true })
export class FooterSetting {
  @ApiProperty({
    description: 'Unique footer settings identifier',
    example: '7c925706-79cf-41fb-89f2-48c9b97948b7',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Logical key for footer settings',
    example: 'default',
    default: 'default',
  })
  @Column({ type: 'varchar', length: 80, unique: true, default: 'default' })
  key: string;

  @ApiProperty({
    description: 'Primary footer title',
    example: 'Niqab Store',
  })
  @Column({ type: 'varchar', length: 200 })
  title: string;

  @ApiPropertyOptional({
    description: 'Footer subtitle/description',
    example: 'Modest fashion for everyone',
  })
  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string | null;

  @ApiPropertyOptional({
    description: 'Footer logo image URL',
    example: 'https://cdn.example.com/footer/logo.png',
  })
  @Column({ type: 'varchar', length: 500, nullable: true })
  logoImageUrl: string | null;

  @ApiPropertyOptional({
    description: 'Optional global brand image URL',
    example: 'https://cdn.example.com/logo.png',
  })
  @Column({ type: 'varchar', length: 500, nullable: true })
  brandImageUrl: string | null;

  @ApiPropertyOptional({
    description: 'Footer copyright text',
    example: 'Copyright 2026 Niqab Store',
  })
  @Column({ type: 'varchar', length: 250, nullable: true })
  copyrightText: string | null;

  @ApiProperty({
    description: 'Array of social links shown in footer',
    example: [
      {
        platform: 'facebook',
        url: 'https://facebook.com/niqab-store',
        imageUrl: null,
      },
    ],
  })
  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  socialLinks: FooterSocialLink[];

  @ApiProperty({
    description: 'Array of footer sections and links',
    example: [
      {
        title: 'Support',
        links: [{ label: 'Contact Us', url: '/contact', imageUrl: null }],
      },
    ],
  })
  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  sections: FooterSection[];

  @ApiProperty({
    description: 'Whether this footer config is active',
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
