import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AttendanceController } from './attendance.controller.js';

@Module({
  imports: [HttpModule],
  controllers: [AttendanceController],
})
export class AttendanceModule {}
