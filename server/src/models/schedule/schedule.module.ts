import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database.module';
import { ScheduleProviders } from './schedule.providers';
import { ScheduleResolver } from './schedule.resolver';
import { ScheduleService } from './schedule.service';

@Module({
  imports: [DatabaseModule],
  providers: [ScheduleResolver, ScheduleService, ...ScheduleProviders],
})
export class ScheduleModule {}
