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
    // id, category, where, when, group
    const { myScheduleList } = await this.userModel.findOne({
      email,
    });

    const mySchedules = [];

    for (let i = 0; i < myScheduleList.length; i++) {
      const scheduleInfo = await this.scheduleModel.findOne({
        _id: myScheduleList[i],
      });

      const { gname } = await this.groupModel.findById(scheduleInfo.group);
      scheduleInfo.group = gname;

      mySchedules.push(scheduleInfo);
    }

    return mySchedules;
  }

  async getScheduleDetail(_id: string): Promise<ReturnSchedule> {
    // id, category, where, when, who, memo, group
    const scheduleInfo = await this.scheduleModel.findOne({ _id });

    // who{host, guest{nickname, record}}, group
    const host = (await this.userModel.findById(scheduleInfo.who.host))
      .nickname;
    const group = (await this.groupModel.findById(scheduleInfo.group)).gname;

    let guest: Guest[];
    for (let i = 0; i < scheduleInfo.who.guest.length; i++) {
      const { nickname } = await this.userModel.findById(
        scheduleInfo.who.guest[i].nickname,
      );
      const record = (
        await this.recordModel.findById(scheduleInfo.who.guest[i].record)
      ).records;
      guest.push({ nickname, record });
    }

    return {
      ...scheduleInfo,
      who: { host, guest },
      group,
    };
  }
  /*
  async getGroupSchedule(schedule: UserEmail): Promise<ReturnSchedule[]> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    try {
      const { email } = schedule;
      const { myGroupList } = await this.userModel.findOne({
        email,
      });

      const allSchedule = {};

      for (let i = 0; i < myGroupList.length; i++) {
        // 내 그룹의 일정을 조회
        const { schedules } = await this.groupModel.findOne({
          gname: myGroupList[i],
        });
        for (let j = 0; j < schedules.length; j++) {
          // 일정을 하나씩 조회
          const scheduleInfo = await this.scheduleModel.findOne({
            _id: schedules[j],
          });

          // id로 되어있는 host, guest를 nickname으로 변경
          const returnSchedule: ReturnSchedule = await this.makeReturnSchedule(
            scheduleInfo,
          );

          // 날짜가 지난 일정은 제외
          if (today <= new Date(scheduleInfo.when)) {
            allSchedule[schedules[j]] = returnSchedule;
          }
        }
      }

      return Object.values(allSchedule);
    } catch (err) {
      console.log(err);
      throw new ApolloError('DB Error', 'DB_ERROR');
    }
  }
*/
}
