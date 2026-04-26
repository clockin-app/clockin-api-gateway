import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { CreateEmployeeDto } from './dto/create-employee.dto.js';
import { UpdateEmployeeDto } from './dto/update-employee.dto.js';
import { JwtGuard } from '../common/guards/jwt.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { JwtPayload } from '../interfaces/jwt-payload.interface.js';
import { handleAxiosError } from '../common/utils/proxy.util.js';

@ApiTags('Employees')
@Controller('employees')
export class EmployeesController {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  private get baseUrl(): string {
    return this.configService.get<string>('EMPLOYEE_SERVICE_URL')!;
  }

  @Get('me')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get own profile' })
  async getMe(@CurrentUser() user: JwtPayload): Promise<any> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/employees/me`, {
          headers: { 'x-employee-id': user.sub },
        }),
      );
      return data;
    } catch (error) {
      handleAxiosError(error);
    }
  }

  @Get()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('HRD_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[HRD_ADMIN] List all employees (paginated)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<any> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/employees`, {
          params: { page, limit },
        }),
      );
      return data;
    } catch (error) {
      handleAxiosError(error);
    }
  }

  @Post()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('HRD_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[HRD_ADMIN] Create new employee' })
  async create(@Body() body: CreateEmployeeDto): Promise<any> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/employees`, body),
      );
      return data;
    } catch (error) {
      handleAxiosError(error);
    }
  }

  @Get(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('HRD_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[HRD_ADMIN] Get employee detail' })
  async findOne(@Param('id') id: string): Promise<any> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/employees/${id}`),
      );
      return data;
    } catch (error) {
      handleAxiosError(error);
    }
  }

  @Put(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('HRD_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[HRD_ADMIN] Update employee data' })
  async update(
    @Param('id') id: string,
    @Body() body: UpdateEmployeeDto,
  ): Promise<any> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.put(`${this.baseUrl}/employees/${id}`, body),
      );
      return data;
    } catch (error) {
      handleAxiosError(error);
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('HRD_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[HRD_ADMIN] Soft delete employee' })
  async remove(@Param('id') id: string): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.delete(`${this.baseUrl}/employees/${id}`),
      );
    } catch (error) {
      handleAxiosError(error);
    }
  }
}
