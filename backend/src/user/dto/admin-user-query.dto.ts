import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class AdminUserQueryDto {
  @ApiPropertyOptional({
    description: 'Page number for pagination (used when no single-user query is provided)',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page for pagination (max 100)',
    example: 20,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    description:
      'Get one specific user by user id. If this is present, endpoint returns single-user mode.',
    example: '35f79af8-4d1f-4af6-a1ad-58446025c264',
  })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({
    description:
      'Get one specific user by exact email. If this is present, endpoint returns single-user mode.',
    example: 'amina@example.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description:
      'Get one specific user by exact phone number. If this is present, endpoint returns single-user mode.',
    example: '+8801700000000',
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({
    description:
      'Text search for list mode. Matches firstName, lastName, email, phoneNumber.',
    example: 'amin',
  })
  @IsOptional()
  @IsString()
  search?: string;
}

