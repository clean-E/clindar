import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Group } from 'src/schemas/group.schema';
import { Records } from 'src/schemas/record.schema';
import { Schedule, ReturnSchedule, Guest } from 'src/schemas/schedule.schema';
import { User } from 'src/schemas/user.schema';

@Injectable()
export class ScheduleQuery {
  constructor(
    @Inject('SCHEDULE_MODEL')
    private scheduleModel: Model<Schedule>,

    @Inject('USER_MODEL')
    private userModel: Model<User>,

    @Inject('GROUP_MODEL')
    private groupModel: Model<Group>,

    @Inject('RECORD_MODEL')
    private recordModel: Model<Records>,
  ) {}

  async getMySchedule(email: string): Promise<Schedule[]> {
    // id, category, spot, when, group
    const { myScheduleList } = await this.userModel.findOne({
      email,
    });

    const mySchedules = await Promise.all(
      myScheduleList.map(async (id) => {
        const schedule = await this.scheduleModel.findById(id);
        schedule.group = (await this.groupModel.findById(schedule.group)).gname;
        return schedule;
      }),
    );

    return mySchedules;
  }

  async getGroupSchedule(email: string): Promise<Schedule[]> {
    // id, category, spot, when, group
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const { myGroupList } = await this.userModel.findOne({
      email,
    });

    const allSchedule = {};
    for (let i = 0; i < myGroupList.length; i++) {
      // 내 그룹의 일정을 조회
      const { schedules, gname } = await this.groupModel.findById(
        myGroupList[i],
      );
      for (let j = 0; j < schedules.length; j++) {
        // 일정을 하나씩 조회
        const scheduleInfo = await this.scheduleModel.findById(schedules[i]);
        scheduleInfo.group = gname;

        // 날짜가 지난 일정은 제외
        if (today <= new Date(scheduleInfo.when)) {
          allSchedule[schedules[j]] = scheduleInfo;
        }
      }
    }

    return Object.values(allSchedule);
  }

  async getScheduleDetail(_id: string): Promise<ReturnSchedule> {
    // id, category, spot, when, host, guest, memo, group
    const scheduleInfo = await this.scheduleModel.findOne({ _id });

    // host, guest{nickname, record}, group
    const host = (await this.userModel.findById(scheduleInfo.host)).nickname;
    const group = (await this.groupModel.findById(scheduleInfo.group)).gname;

    let guest: Guest[];
    for (let i = 0; i < scheduleInfo.guest.length; i++) {
      const { nickname } = await this.userModel.findById(
        scheduleInfo.guest[i].nickname,
      );
      const record = (
        await this.recordModel.findById(scheduleInfo.guest[i].record)
      ).records;
      guest.push({ nickname, record });
    }

    return {
      ...scheduleInfo,
      host,
      guest,
      group,
    };
  }
}
