import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UserRole {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
}

export enum UserStatus {
  ACTIVE = 'active',
  BLOCKED = 'blocked',
  SUSPENDED = 'suspended',
}

@Entity('users')
@Index('idx_users_role', ['role'])
@Index('idx_users_created_at', ['createdAt'])
export class User {
  @ApiProperty({
    description: 'Unique user identifier (UUID)',
    example: '35f79af8-4d1f-4af6-a1ad-58446025c264',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'User first name',
    example: 'Amina',
  })
  @Column({ type: 'varchar', length: 80 })
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Rahman',
  })
  @Column({ type: 'varchar', length: 80 })
  lastName: string;

  @ApiProperty({
    description: 'Unique email used for login and notifications',
    example: 'amina@example.com',
  })
  @Column({ type: 'varchar', length: 160, unique: true })
  email: string;

  @ApiPropertyOptional({
    description: 'Unique mobile number',
    example: '+8801700000000',
  })
  @Column({ type: 'varchar', length: 30, unique: true, nullable: true })
  phoneNumber: string | null;

  @Column({ type: 'varchar', length: 255, select: false })
  passwordHash: string;

  @ApiProperty({
    description: 'User role for authorization',
    enum: UserRole,
    example: UserRole.CUSTOMER,
  })
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CUSTOMER,
  })
  role: UserRole;

  @ApiProperty({
    description: 'Operational account status',
    enum: UserStatus,
    example: UserStatus.ACTIVE,
  })
  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @ApiProperty({
    description: 'Whether email has been verified',
    example: false,
  })
  @Column({ type: 'boolean', default: false })
  isEmailVerified: boolean;

  @ApiProperty({
    description: 'Whether phone number has been verified',
    example: false,
  })
  @Column({ type: 'boolean', default: false })
  isPhoneVerified: boolean;

  @ApiPropertyOptional({
    description: 'Optional avatar image URL',
    example: 'https://cdn.example.com/users/35f79af8/avatar.png',
  })
  @Column({ type: 'varchar', length: 500, nullable: true })
  avatarUrl: string | null;

  @ApiPropertyOptional({
    description: 'Default shipping address in JSON format',
    example: {
      fullName: 'Amina Rahman',
      phone: '+8801700000000',
      country: 'Bangladesh',
      city: 'Dhaka',
      area: 'Mirpur',
      addressLine1: 'House 11, Road 7',
      postalCode: '1216',
    },
  })
  @Column({ type: 'jsonb', nullable: true })
  defaultShippingAddress: Record<string, unknown> | null;

  @ApiPropertyOptional({
    description: 'Default billing address in JSON format',
    example: {
      fullName: 'Amina Rahman',
      country: 'Bangladesh',
      city: 'Dhaka',
      addressLine1: 'House 11, Road 7',
      postalCode: '1216',
    },
  })
  @Column({ type: 'jsonb', nullable: true })
  defaultBillingAddress: Record<string, unknown> | null;

  @ApiPropertyOptional({
    description: 'Last successful login timestamp',
    example: '2026-03-04T12:45:00.000Z',
  })
  @Column({ type: 'timestamptz', nullable: true })
  lastLoginAt: Date | null;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2026-03-01T08:00:00.000Z',
  })
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2026-03-03T10:10:00.000Z',
  })
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt: Date | null;
}
