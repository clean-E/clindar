import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Group, ReturnGroup } from 'src/schemas/group.schema';
import { Result, User } from 'src/schemas/user.schema';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { ApolloError } from 'apollo-server-express';
import { ReturnSchedule, Schedule } from 'src/schemas/schedule.schema';

dotenv.config({
  path: path.resolve('.development.env'),
});

@Injectable()
export class GroupQuery {
  constructor(
    @Inject('GROUP_MODEL')
    private groupModel: Model<Group>,

    @Inject('USER_MODEL')
    private userModel: Model<User>,

    @Inject('SCHEDULE_MODEL')
    private scheduleModel: Model<Schedule>,
  ) {}

  async checkDuplicateGroupName(gname: string): Promise<Result> {
    const duplicateCheck = await this.groupModel.exists({ gname });
    return { success: duplicateCheck ? false : true };
  }

  async getAllGroup(): Promise<Group[]> {
    // _id, gname, mainCategory, age, secret
    return await this.groupModel.find();
  }

  async getMyGroup(email: string): Promise<Group[]> {
    const userInfo = await this.userModel.findOne({ email });
    const myGroupList = await Promise.all(
      userInfo.myGroupList.map(async (group) => {
        return await this.groupModel.findById(group);
      }),
    );

    return myGroupList;
  }

  async getGroupDetail(email: string, _id: string): Promise<ReturnGroup> {
    const userInfo = await this.userModel.findOne({ email });
    const groupInfo = await this.groupModel.findById(_id);

    // leader, memberList, schedules, join
    const leader = (await this.userModel.findById(groupInfo.leader)).nickname;
    const memberList = await Promise.all(
      groupInfo.memberList.map(async (mem) => {
        return (await this.userModel.findById(mem)).nickname;
      }),
    );
    const schedules: ReturnSchedule[] = await Promise.all(
      groupInfo.schedules.map(async (schedule) => {
        return await this.scheduleModel.findById(schedule);
      }),
    );
    const join = memberList.includes(userInfo.nickname);

    return { ...groupInfo, leader, memberList, schedules, join };
  }

  async openSecretGroup(_id: string, password: string): Promise<ReturnGroup> {
    const groupInfo = await this.groupModel.findOne({ _id });
    const passwordCompareResult = await bcrypt.compare(
      password,
      groupInfo.password,
    );
    if (passwordCompareResult) {
      const groupInfo = await this.groupModel.findById(_id);
      // leader, memberList, schedules, join
      const leader = (await this.userModel.findById(groupInfo.leader)).nickname;
      const memberList = await Promise.all(
        groupInfo.memberList.map(async (mem) => {
          return (await this.userModel.findById(mem)).nickname;
        }),
      );
      const schedules: ReturnSchedule[] = await Promise.all(
        groupInfo.schedules.map(async (schedule) => {
          return await this.scheduleModel.findById(schedule);
        }),
      );

      return { ...groupInfo, leader, memberList, schedules };
    } else {
      throw new ApolloError('Wrong Password', 'WRONG_PASSWORD');
    }
  }
}
