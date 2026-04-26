import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { EmployeesController } from './employees.controller.js';

@Module({
  imports: [HttpModule],
  controllers: [EmployeesController],
})
export class EmployeesModule {}
