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
import { ScheduleMutation } from './schedule_mutation.service';
import { ScheduleQuery } from './schedule_query.service';

@Resolver('Schedule')
export class ScheduleResolver {
  constructor(
    private scheduleQuery: ScheduleQuery,
    private scheduleMutation: ScheduleMutation,
  ) {}

  @Query(() => [Schedule])
  async getAllSchedule(@Args('schedule') schedule: UserEmail) {
    return await this.scheduleQuery.getAllSchedule(schedule);
  }
  @Query(() => [Schedule])
  async getGroupSchedule(@Args('schedule') schedule: UserEmail) {
    return await this.scheduleQuery.getGroupSchedule(schedule);
  }
  @Query(() => Schedule)
  async getScheduleDetail(@Args('schedule') schedule: ScheduleId) {
    return await this.scheduleQuery.getScheduleDetail(schedule);
  }
  @Mutation(() => Schedule)
  async createSchedule(@Args('schedule') schedule: CreateScheduleInput) {
    return await this.scheduleMutation.createSchedule(schedule);
  }
  @Mutation(() => String)
  async deleteSchedule(@Args('schedule') schedule: DeleteScheduleInput) {
    return await this.scheduleMutation.deleteSchedule(schedule);
  }
  @Mutation(() => Schedule)
  async editSchedule(@Args('schedule') schedule: EditScheduleInput) {
    return await this.scheduleMutation.editSchedule(schedule);
  }
  // @Mutation(() => Schedule)
  // async inviteSchedule(@Args('schedule') schedule: InviteScheduleInput) {
  //   return await this.scheduleMutation.inviteSchedule(schedule);
  // }
  // @Mutation(() => Schedule)
  // async joinSchedule(@Args('schedule') schedule: JoinScheduleInput) {
  //   return await this.scheduleMutation.joinSchedule(schedule);
  // }
  // @Mutation(() => Schedule)
  // async editRecord(@Args('schedule') schedule: EditRecordInput) {
  //   return await this.scheduleMutation.editRecord(schedule);
  // }
}
