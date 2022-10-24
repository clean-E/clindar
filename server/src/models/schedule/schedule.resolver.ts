import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  CreateScheduleInput,
  EditScheduleInput,
  ReturnSchedule,
  Schedule,
} from 'src/schemas/schedule.schema';
import { Result } from 'src/schemas/user.schema';
import { ScheduleMutation } from './schedule_mutation.service';
import { ScheduleQuery } from './schedule_query.service';

@Resolver('Schedule')
export class ScheduleResolver {
  constructor(
    private scheduleQuery: ScheduleQuery,
    private scheduleMutation: ScheduleMutation,
  ) {}

  @Query(() => [Schedule])
  async getMySchedule(@Args('email') email: string) {
    return await this.scheduleQuery.getMySchedule(email);
  }
  @Query(() => [Schedule])
  async getGroupSchedule(@Args('email') email: string) {
    return await this.scheduleQuery.getGroupSchedule(email);
  }
  @Query(() => ReturnSchedule)
  async getScheduleDetail(@Args('_id') _id: string) {
    return await this.scheduleQuery.getScheduleDetail(_id);
  }

  @Mutation(() => ReturnSchedule)
  async createSchedule(@Args('schedule') schedule: CreateScheduleInput) {
    return await this.scheduleMutation.createSchedule(schedule);
  }
  // @Mutation(() => ReturnSchedule)
  // async editSchedule(@Args('schedule') schedule: EditScheduleInput) {
  //   return await this.scheduleMutation.editSchedule(schedule);
  // }
  @Mutation(() => Result)
  async deleteSchedule(@Args('_id') _id: string, @Args('email') email: string) {
    return await this.scheduleMutation.deleteSchedule(_id, email);
  }
  @Mutation(() => ReturnSchedule)
  async joinSchedule(@Args('_id') _id: string, @Args('email') email: string) {
    return await this.scheduleMutation.joinSchedule(_id, email);
  }
  @Mutation(() => ReturnSchedule)
  async comeoutSchedule(
    @Args('_id') _id: string,
    @Args('email') email: string,
  ) {
    return await this.scheduleMutation.comeoutSchedule(_id, email);
  }
  @Mutation(() => ReturnSchedule)
  async inviteSchedule(
    @Args('_id') _id: string,
    @Args('email') email: string,
    @Args('guest') guest: string,
  ) {
    return await this.scheduleMutation.inviteSchedule(_id, email, guest);
  }
  // @Mutation(() => ReturnSchedule)
  // async editRecord(@Args('schedule') schedule: EditRecordInput) {
  //   return await this.scheduleMutation.editRecord(schedule);
  // }
}
