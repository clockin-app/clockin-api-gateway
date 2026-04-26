import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CheckInDto {
  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  photo?: Express.Multer.File;

  @ApiPropertyOptional({ example: 'Working from home today' })
  @IsOptional()
  @IsString()
  notes?: string;
}
