import { Inject, Injectable } from '@nestjs/common';
import { ApolloError } from 'apollo-server-express';
import { Model } from 'mongoose';
import { Group } from 'src/schemas/group.schema';
import {
  Schedule,
  ScheduleId,
  ReturnSchedule,
  Guest,
} from 'src/schemas/schedule.schema';
import { User, UserEmail } from 'src/schemas/user.schema';

@Injectable()
export class ScheduleQuery {
  constructor(
    @Inject('SCHEDULE_MODEL')
    private scheduleModel: Model<Schedule>,

    @Inject('USER_MODEL')
    private userModel: Model<User>,

    @Inject('GROUP_MODEL')
    private groupModel: Model<Group>,
  ) {}

  async getAllSchedule(schedule: UserEmail): Promise<ReturnSchedule[]> {
    try {
      const { email } = schedule;
      const { myScheduleList } = await this.userModel.findOne({
        email,
      });

      const allSchedule = {};

      for (let i = 0; i < myScheduleList.length; i++) {
        const scheduleInfo = await this.scheduleModel.findOne({
          _id: myScheduleList[i],
        });
        const who = { host: '', guest: [] };
        for (let idx = 0; idx < scheduleInfo.who.guest.length; idx++) {
          const { nickname } = await this.userModel.findById(
            scheduleInfo.who.guest[idx].nickname,
          );
          if (idx === 0) {
            who.host = nickname;
          }
          const guest: Guest = { nickname, record: [] };
          who.guest.push(guest);
        }

        const returnSchedule: ReturnSchedule = {
          ...scheduleInfo,
          who,
        };
        allSchedule[myScheduleList[i]] = returnSchedule;
      }

      return Object.values(allSchedule);
    } catch (err) {
      console.log(err);
      throw new ApolloError('DB Error', 'DB_ERROR');
    }
  }

  async getGroupSchedule(schedule: UserEmail): Promise<Schedule[]> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    try {
      const { email } = schedule;
      const { myGroupList } = await this.userModel.findOne({
        email,
      });

      const allSchedule = {};

      for (let i = 0; i < myGroupList.length; i++) {
        const { schedules } = await this.groupModel.findOne({
          gname: myGroupList[i],
        });
        for (let j = 0; j < schedules.length; j++) {
          const scheduleInfo = await this.scheduleModel.findOne({
            _id: schedules[j],
          });

          if (today <= new Date(scheduleInfo.when)) {
            allSchedule[schedules[j]] = scheduleInfo;
          }
        }
      }

      return Object.values(allSchedule);
    } catch (err) {
      console.log(err);
      throw new ApolloError('DB Error', 'DB_ERROR');
    }
  }

  async getScheduleDetail(schedule: ScheduleId): Promise<Schedule> {
    const { _id } = schedule;
    try {
      return await this.scheduleModel.findOne({ _id });
    } catch (err) {
      console.log(err);
      throw new ApolloError('DB Error', 'DB_ERROR');
    }
  }
}
