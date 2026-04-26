import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export enum EmployeeRole {
  EMPLOYEE = 'EMPLOYEE',
  HRD_ADMIN = 'HRD_ADMIN',
}

export class CreateEmployeeDto {
  @ApiProperty({ example: 'EMP001' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  nik: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  full_name: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  @MaxLength(100)
  email: string;

  @ApiProperty({ example: 'secret123', minLength: 6 })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ example: 'Engineering' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  department?: string;

  @ApiPropertyOptional({ example: 'Backend Developer' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  position?: string;

  @ApiPropertyOptional({ enum: EmployeeRole, default: EmployeeRole.EMPLOYEE })
  @IsOptional()
  @IsEnum(EmployeeRole)
  role?: EmployeeRole;
}
