import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database.module';
import { ScheduleProviders } from './schedule.providers';
import { ScheduleResolver } from './schedule.resolver';
import { ScheduleMutation } from './schedule_mutation.service';
import { ScheduleQuery } from './schedule_query.service';

@Module({
  imports: [DatabaseModule],
  providers: [
    ScheduleResolver,
    ScheduleQuery,
    ScheduleMutation,
    ...ScheduleProviders,
  ],
})
export class ScheduleModule {}
