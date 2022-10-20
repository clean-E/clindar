import { Inject, Injectable } from '@nestjs/common';
import { ApolloError } from 'apollo-server-express';
import { Model } from 'mongoose';
import { Group } from 'src/schemas/group.schema';
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
  ) {}

  async getMySchedule(email: string): Promise<ReturnSchedule[]> {
    const { myScheduleList } = await this.userModel.findOne({
      email,
    });

    const allSchedule = {};

    for (let i = 0; i < myScheduleList.length; i++) {
      // 일정 id로 일정을 하나씩 조회
      const scheduleInfo = await this.scheduleModel.findOne({
        _id: myScheduleList[i],
      });

      // id로 되어있는 host, guest를 nickname으로 변경
      const returnSchedule: ReturnSchedule = await this.makeReturnSchedule(
        scheduleInfo,
      );

      // 저장
      allSchedule[myScheduleList[i]] = returnSchedule;
    }

    return Object.values(allSchedule);
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
  async getScheduleDetail(_id: string): Promise<ReturnSchedule> {
    try {
      const scheduleInfo = await this.scheduleModel.findOne({ _id });

      return await this.makeReturnSchedule(scheduleInfo);
    } catch (err) {
      console.log(err);
      throw new ApolloError('DB Error', 'DB_ERROR');
    }
  }

  async makeReturnSchedule(schedule: Schedule): Promise<ReturnSchedule> {
    const { who, group } = schedule;

    const editWho = { host: '', guest: [] };
    for (let idx = 0; idx < who.guest.length; idx++) {
      const { nickname } = await this.userModel.findById(
        who.guest[idx].nickname,
      );
      if (idx === 0) {
        editWho.host = nickname;
      }
      const guest: Guest = { nickname, record: [] };
      editWho.guest.push(guest);
    }

    let editGroup = '';
    if (group !== '') {
      const groupInfo = await this.groupModel.findOne({ id: group });
      editGroup = groupInfo.gname;
    }
    const returnSchedule: ReturnSchedule = {
      _id: schedule.id,
      category: schedule.category,
      where: schedule.where,
      when: schedule.when,
      who: editWho,
      memo: schedule.memo,
      group: editGroup,
    };

    return returnSchedule;
  }
}
