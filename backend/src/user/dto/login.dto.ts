import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @ApiPropertyOptional({
    description: 'Unified login identity (email or phoneNumber)',
    example: 'amina@example.com',
  })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  identity?: string;

  @ApiPropertyOptional({
    description: 'Legacy email field for login',
    example: 'amina@example.com',
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(160)
  email?: string;

  @ApiPropertyOptional({
    description: 'Legacy phone number field for login',
    example: '+8801700000000',
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phoneNumber?: string;

  @ApiProperty({
    description: 'Raw password to verify',
    example: 'StrongP@ssword123',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password: string;
}
