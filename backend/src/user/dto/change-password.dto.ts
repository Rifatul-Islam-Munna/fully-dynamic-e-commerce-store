import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Current account password',
    example: 'OldPassword123',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  currentPassword: string;

  @ApiProperty({
    description: 'New account password',
    example: 'NewPassword123',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  newPassword: string;
}
