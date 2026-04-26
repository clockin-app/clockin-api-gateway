import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { memoryStorage } from 'multer';
import FormData from 'form-data';
import { JwtGuard } from '../common/guards/jwt.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { JwtPayload } from '../interfaces/jwt-payload.interface.js';
import { handleAxiosError } from '../common/utils/proxy.util.js';
import { CheckInDto } from './dto/check-in.dto.js';
import { CheckOutDto } from './dto/check-out.dto.js';

@ApiTags('Attendance')
@Controller('attendance')
export class AttendanceController {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  private get baseUrl(): string {
    return this.configService.get<string>('ATTENDANCE_SERVICE_URL')!;
  }

  @Post('check-in')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('EMPLOYEE')
  @UseInterceptors(FileInterceptor('photo', { storage: memoryStorage() }))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Clock in and upload selfie as WFH proof' })
  async checkIn(
    @CurrentUser() user: JwtPayload,
    @Body() body: CheckInDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<any> {
    const form = new FormData();
    if (file) {
      form.append('photo', file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
      });
    }
    if (body?.notes) form.append('notes', body.notes);

    try {
      const { data } = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/attendance/check-in`, form, {
          headers: { 'x-employee-id': user.sub, ...form.getHeaders() },
        }),
      );
      return data;
    } catch (error) {
      handleAxiosError(error);
    }
  }

  @Post('check-out')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('EMPLOYEE')
  @UseInterceptors(FileInterceptor('photo', { storage: memoryStorage() }))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Clock out and upload selfie as WFH proof' })
  async checkOut(
    @CurrentUser() user: JwtPayload,
    @Body() body: CheckOutDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<any> {
    const form = new FormData();
    if (file) {
      form.append('photo', file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
      });
    }
    if (body?.notes) form.append('notes', body.notes);

    try {
      const { data } = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/attendance/check-out`, form, {
          headers: { 'x-employee-id': user.sub, ...form.getHeaders() },
        }),
      );
      return data;
    } catch (error) {
      handleAxiosError(error);
    }
  }

  @Get('today')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('EMPLOYEE')
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get today's attendance status" })
  async getToday(@CurrentUser() user: JwtPayload): Promise<any> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/attendance/today`, {
          headers: { 'x-employee-id': user.sub },
        }),
      );
      return data;
    } catch (error) {
      handleAxiosError(error);
    }
  }

  @Get('history')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('EMPLOYEE')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get own attendance history (paginated)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  async getHistory(
    @CurrentUser() user: JwtPayload,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<any> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/attendance/history`, {
          headers: { 'x-employee-id': user.sub },
          params: { page, limit },
        }),
      );
      return data;
    } catch (error) {
      handleAxiosError(error);
    }
  }

  @Get('monitor')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('HRD_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[HRD_ADMIN] Get all employees attendance records' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  async getMonitor(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<any> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/attendance/monitor`, {
          params: { page, limit },
        }),
      );
      return data;
    } catch (error) {
      handleAxiosError(error);
    }
  }

  @Get('monitor/:id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('HRD_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '[HRD_ADMIN] Get specific employee attendance records',
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  async getMonitorById(
    @Param('id') id: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<any> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/attendance/monitor/${id}`, {
          params: { page, limit },
        }),
      );
      return data;
    } catch (error) {
      handleAxiosError(error);
    }
  }
}
