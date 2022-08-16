import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  CreateScheduleInput,
  DeleteScheduleInput,
  EditRecordInput,
  EditScheduleInput,
  InviteScheduleInput,
  JoinScheduleInput,
  Schedule,
  ScheduleId,
} from 'src/schemas/schedule.schema';
import { UserEmail } from 'src/schemas/user.schema';
import { ScheduleService } from './schedule.service';

@Resolver('Schedule')
export class ScheduleResolver {
  constructor(private scheduleService: ScheduleService) {}

  @Query(() => [Schedule])
  async getAllSchedule(@Args('schedule') schedule: UserEmail) {
    return await this.scheduleService.getAllSchedule(schedule);
  }
  @Query(() => [Schedule])
  async getGroupSchedule(@Args('schedule') schedule: UserEmail) {
    return await this.scheduleService.getGroupSchedule(schedule);
  }
  @Query(() => Schedule)
  async getScheduleDetail(@Args('schedule') schedule: ScheduleId) {
    return await this.scheduleService.getScheduleDetail(schedule);
  }
  @Mutation(() => Schedule)
  async createSchedule(@Args('schedule') schedule: CreateScheduleInput) {
    return await this.scheduleService.createSchedule(schedule);
  }
  @Mutation(() => String)
  async deleteSchedule(@Args('schedule') schedule: DeleteScheduleInput) {
    return await this.scheduleService.deleteSchedule(schedule);
  }
  @Mutation(() => Schedule)
  async editSchedule(@Args('schedule') schedule: EditScheduleInput) {
    return await this.scheduleService.editSchedule(schedule);
  }
  // @Mutation(() => Schedule)
  // async inviteSchedule(@Args('schedule') schedule: InviteScheduleInput) {
  //   return await this.scheduleService.inviteSchedule(schedule);
  // }
  @Mutation(() => Schedule)
  async joinSchedule(@Args('schedule') schedule: JoinScheduleInput) {
    return await this.scheduleService.joinSchedule(schedule);
  }
  @Mutation(() => Schedule)
  async editRecord(@Args('schedule') schedule: EditRecordInput) {
    return await this.scheduleService.editRecord(schedule);
  }
}
