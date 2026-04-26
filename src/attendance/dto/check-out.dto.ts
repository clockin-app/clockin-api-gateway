import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CheckOutDto {
  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  photo?: Express.Multer.File;

  @ApiPropertyOptional({ example: 'Done for the day' })
  @IsOptional()
  @IsString()
  notes?: string;
}
