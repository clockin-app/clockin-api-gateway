import { HttpException, InternalServerErrorException } from '@nestjs/common';
import { AxiosError } from 'axios';

export function handleAxiosError(error: unknown): never {
  if (error instanceof AxiosError && error.response) {
    const body = error.response.data as Record<string, unknown>;
    throw new HttpException(body, error.response.status);
  }
  throw new InternalServerErrorException('Upstream service unavailable');
}
