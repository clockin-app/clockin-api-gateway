import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { JwtGuard } from '../common/guards/jwt.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { JwtPayload } from '../interfaces/jwt-payload.interface.js';
import { handleAxiosError } from '../common/utils/proxy.util.js';
import { LoginDto } from './dto/login.dto.js';
import { RefreshDto } from './dto/refresh.dto.js';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  private get baseUrl(): string {
    return this.configService.get<string>('AUTH_SERVICE_URL')!;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login and receive access + refresh tokens' })
  async login(@Body() body: LoginDto): Promise<any> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/auth/login`, body),
      );
      return data;
    } catch (error) {
      handleAxiosError(error);
    }
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get new access token using refresh token' })
  async refresh(@Body() body: RefreshDto): Promise<any> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/auth/refresh`, body),
      );
      return data;
    } catch (error) {
      handleAxiosError(error);
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Invalidate refresh token' })
  async logout(@CurrentUser() user: JwtPayload): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/auth/logout`,
          {},
          { headers: { 'x-employee-id': user.sub } },
        ),
      );
    } catch (error) {
      handleAxiosError(error);
    }
  }
}
