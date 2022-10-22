import { Inject, Injectable } from '@nestjs/common';
import { ApolloError } from 'apollo-server-express';
import { Model } from 'mongoose';
import { Group } from 'src/schemas/group.schema';
import {
  Schedule,
  CreateScheduleInput,
  EditScheduleInput,
  ReturnSchedule,
  Guest,
} from 'src/schemas/schedule.schema';
import { Result, User } from 'src/schemas/user.schema';
import { Records } from 'src/schemas/record.schema';

@Injectable()
export class ScheduleMutation {
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

  async createSchedule(schedule: CreateScheduleInput): Promise<ReturnSchedule> {
    // email, catecory, spot, when, host, guest, memo, group
    const { email } = schedule;
    delete schedule.email;

    const newSchedule = await this.scheduleModel.create(schedule);

    // guest{nickname, record}, group의 일정 목록에 추가, record 생성
    let guest: Guest[];
    for (let i = 0; i < schedule.guest.length; i++) {
      const userInfo = await this.userModel.findById(
        schedule.guest[i].nickname,
      );
      const record = await this.recordModel.create({
        sId: newSchedule._id,
        uId: userInfo._id,
        records: [],
      });
      await this.userModel.updateOne(
        { _id: userInfo._id },
        {
          myScheduleList: [...userInfo.myScheduleList, newSchedule._id],
          myRecord: [...userInfo.myRecord, record._id],
        },
      );

      const guestInfo = { nickname: userInfo.nickname, record: record.records };
      guest.push(guestInfo);
    }

    const host = (await this.userModel.findOne({ email })).nickname;
    const groupInfo = await this.groupModel.findById(schedule.group);
    const group = groupInfo.gname;
    await this.groupModel.updateOne(
      { _id: groupInfo._id },
      { schedules: [...groupInfo.schedules, newSchedule._id] },
    );

    return { ...newSchedule, host, guest, group };
  }

  // async editSchedule(schedule: EditScheduleInput): Promise<ReturnSchedule> {
  //   const { email, _id } = schedule;
  //   delete schedule.email;
  //   delete schedule._id;
  // }
  // async deleteSchedule(_id: string, email: string): Promise<Result> {}

  // async joinSchedule(_id: string, email: string): Promise<ReturnSchedule> {}

  // async comeoutSchedule(_id: string, email: string): Promise<Result> {}

  // async inviteSchedule(
  //   _id: string,
  //   email: string,
  //   guest: string,
  // ): Promise<ReturnSchedule> {}

  /*
  async editRecord(schedule: EditRecordInput): Promise<ReturnSchedule> {
    const { _id, nickname, record } = schedule;

    // record 없으면 생성, 있으면 업데이트
    // record 없어서 생성했으면 user, schedule에도 추가
    try {
      const recordInfo = await this.recordModel.findOne({ sId: _id });
      const userInfo = await this.userModel.findOne({ nickname });

      if (recordInfo) {
        await this.recordModel.updateOne({ sId: _id }, { record });
      } else {
        // 기록 데이터 생성, 저장
        const recordSchema = {
          sId: _id,
          uId: userInfo.id,
          records: record,
        };
        const newRecord = await this.recordModel.create(recordSchema);

        // 일정에 기록 저장
        const scheduleInfo = await this.scheduleModel.findOne({ _id });
        for (let i = 0; i < scheduleInfo.who.guest.length; i++) {
          if (scheduleInfo.who.guest[i].nickname === nickname) {
            scheduleInfo.who.guest[i].record = newRecord.id;
            break;
          }
        }
        await this.scheduleModel.updateOne({ _id }, { who: scheduleInfo.who });

        // 유저에 기록 저장
        await this.userModel.updateOne(
          { nickname },
          { records: [...userInfo.records, newRecord.id] },
        );
      }

      // 업데이트된 일정 정보를 가져와서 id로 된 데이터를 알맞게 변경
      const scheduleInfo = await this.scheduleModel.findOne({ _id });
      const host = await this.userModel.findOne({ id: scheduleInfo.who.host });
      const guests = [];

      for (let i = 0; i < scheduleInfo.who.guest.length; i++) {
        const { nickname } = await this.userModel.findById(
          scheduleInfo.who.guest[i].nickname,
        );
        const { records } = await this.recordModel.findById(
          scheduleInfo.who.guest[i].record,
        );
        const guest: Guest = { nickname, record: records };
        guests.push(guest);
      }
      const who = { host: host.nickname, guest: guests };
      let editGroup = '';
      if (scheduleInfo.group !== '') {
        const groupInfo = await this.groupModel.findOne({
          id: scheduleInfo.group,
        });
        editGroup = groupInfo.gname;
      }
      const returnSchedule: ReturnSchedule = {
        _id: scheduleInfo.id,
        category: scheduleInfo.category,
        where: scheduleInfo.where,
        when: scheduleInfo.when,
        who,
        memo: scheduleInfo.memo,
        group: editGroup,
      };

      return returnSchedule;
    } catch (err) {
      console.log(err);
      throw new ApolloError('DB Error', 'DB_ERROR');
    }
  }
*/
}
