import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class DeleteUserQueryDto {
  @ApiPropertyOptional({
    description:
      'User id to delete via query. If omitted, current authenticated user will be deleted.',
    example: '35f79af8-4d1f-4af6-a1ad-58446025c264',
  })
  @IsOptional()
  @IsUUID()
  userId?: string;
}

