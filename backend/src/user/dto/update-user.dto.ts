import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserRole, UserStatus } from '../entities/user.entity';

export class UpdateUserDto {
  @ApiProperty({
    description:
      'Target user id for PATCH. As requested, user id is taken from body (not route param).',
    example: '35f79af8-4d1f-4af6-a1ad-58446025c264',
  })
  @IsUUID()
  userId: string;

  @ApiPropertyOptional({ example: 'Amina' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  firstName?: string;

  @ApiPropertyOptional({ example: 'Rahman' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  lastName?: string;

  @ApiPropertyOptional({ example: 'amina@example.com' })
  @IsOptional()
  @IsEmail()
  @MaxLength(160)
  email?: string;

  @ApiPropertyOptional({ example: '+8801700000000' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phoneNumber?: string | null;

  @ApiPropertyOptional({
    example: 'https://cdn.example.com/users/35f79af8/avatar.png',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  avatarUrl?: string | null;

  @ApiPropertyOptional({
    description: 'Admin-only field',
    enum: UserRole,
    example: UserRole.CUSTOMER,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({
    description: 'Admin-only field',
    enum: UserStatus,
    example: UserStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiPropertyOptional({
    description: 'Admin-only field',
    example: true,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isEmailVerified?: boolean;

  @ApiPropertyOptional({
    description: 'Admin-only field',
    example: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isPhoneVerified?: boolean;

  @ApiPropertyOptional({
    description: 'Default shipping address object',
    example: {
      fullName: 'Amina Rahman',
      phone: '+8801700000000',
      city: 'Dhaka',
      addressLine1: 'House 11, Road 7',
    },
  })
  @IsOptional()
  @IsObject()
  defaultShippingAddress?: Record<string, unknown> | null;

  @ApiPropertyOptional({
    description: 'Default billing address object',
    example: {
      fullName: 'Amina Rahman',
      city: 'Dhaka',
      addressLine1: 'House 11, Road 7',
    },
  })
  @IsOptional()
  @IsObject()
  defaultBillingAddress?: Record<string, unknown> | null;
}
