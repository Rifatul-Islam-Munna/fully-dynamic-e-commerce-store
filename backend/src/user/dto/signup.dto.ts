import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SignupDto {
  @ApiProperty({
    description: 'First name',
    example: 'Amina',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  firstName: string;

  @ApiProperty({
    description: 'Last name',
    example: 'Rahman',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  lastName: string;

  @ApiProperty({
    description: 'Unique email address',
    example: 'amina@example.com',
  })
  @IsEmail()
  @MaxLength(160)
  email: string;

  @ApiPropertyOptional({
    description: 'Optional phone number',
    example: '+8801700000000',
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phoneNumber?: string;

  @ApiProperty({
    description: 'Raw password (will be hashed with bcrypt)',
    example: 'StrongP@ssword123',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password: string;
}

