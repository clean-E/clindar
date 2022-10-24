import { Inject, Injectable } from '@nestjs/common';
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

    // guest{nickname, record}, group의 일정 목록에 추가
    const guest: Guest[] = await Promise.all(
      newSchedule.guest.map(async (guest) => {
        const userInfo = await this.userModel.findById(guest.nickname);
        return {
          nickname: userInfo.nickname,
          record: [],
        };
      }),
    );

    const host = (await this.userModel.findOne({ email })).nickname;
    let group = '';

    if (schedule.group) {
      const { gname } = await this.groupModel.findByIdAndUpdate(
        schedule.group,
        {
          $push: { schedules: newSchedule.id },
        },
      );
      group = gname;
    }

    return { ...newSchedule, host, guest, group };
  }

  // async editSchedule(schedule: EditScheduleInput): Promise<ReturnSchedule> {
  //   const { email, _id } = schedule;
  //   delete schedule.email;
  //   delete schedule._id;
  // }
  async deleteSchedule(_id: string, email: string): Promise<Result> {
    const scheduleInfo = await this.scheduleModel.findById(_id);
    const hostInfo = await this.userModel.findOne({ email });
    if (scheduleInfo.host !== hostInfo.id) {
      return { success: false };
    }

    // guest, group의 일정에서 제거
    const { guest, group } = await this.scheduleModel.findById(_id);

    for (let i = 0; i < guest.length; i++) {
      let { myScheduleList } = await this.userModel.findById(guest[i].nickname);
      myScheduleList = myScheduleList.splice(myScheduleList.indexOf(_id), 1);
      await this.userModel.findByIdAndUpdate(guest[i].nickname, {
        myScheduleList: [...myScheduleList],
      });
    }

    const groupInfo = await this.groupModel.findById(group).exec();
    if (groupInfo) {
      let { schedules } = groupInfo;
      schedules = schedules.splice(schedules.indexOf(_id), 1);
      await this.groupModel.findByIdAndUpdate(group, {
        schedules: [...schedules],
      });
    }

    return { success: true };
  }

  async joinSchedule(_id: string, email: string): Promise<ReturnSchedule> {
    // catecory, spot, when, host, guest{nickname, record}, memo, group

    // 일정의 게스트 목록에 추가
    // 참여한 사람의 일정 목록에 추가

    const userInfo = await this.userModel.findOne({ email });
    const scheduleInfo = await this.scheduleModel.findById(_id);

    await this.userModel.findOneAndUpdate(
      { email },
      {
        myScheduleList: [...userInfo.myScheduleList, _id],
      },
    );
    await this.scheduleModel.findByIdAndUpdate(_id, {
      guest: [...scheduleInfo.guest, { nickname: userInfo.id, record: '' }],
    });

    const newGuest: Guest = {
      nickname: userInfo.nickname,
      record: [],
    };
    const guest: Guest[] = await Promise.all(
      scheduleInfo.guest.map(async (guest) => {
        const userInfo = await this.userModel.findById(guest.nickname);
        const recordInfo = await this.recordModel.findById(guest.record).exec();

        return {
          nickname: userInfo.nickname,
          record: recordInfo ? recordInfo.records : [],
        };
      }),
    );
    guest.push(newGuest);

    if (scheduleInfo.group) {
      scheduleInfo.group = (
        await this.groupModel.findById(scheduleInfo.group)
      ).gname;
    }

    return { ...scheduleInfo, guest };
  }

  async comeoutSchedule(_id: string, email: string): Promise<ReturnSchedule> {
    // 일정의 게스트 목록에서 제거
    // 기록이 있으면 유저의 기록 목록에서 제거, record 제거
    // 유저의 일정 목록에서 제거

    const scheduleInfo = await this.scheduleModel.findById(_id);
    const userInfo = await this.userModel.findOne({ email });
    userInfo.myScheduleList = userInfo.myScheduleList.splice(
      userInfo.myScheduleList.indexOf(_id),
      1,
    );

    const recordInfo = await this.recordModel
      .findOneAndDelete({ sId: _id })
      .exec();

    if (recordInfo) {
      userInfo.myRecord = userInfo.myRecord.splice(
        userInfo.myRecord.indexOf(recordInfo.id),
        1,
      );
    }
    await this.userModel.updateOne(
      { email },
      {
        myScheduleList: [...userInfo.myScheduleList],
        myRecord: [...userInfo.myRecord],
      },
    );

    scheduleInfo.guest = scheduleInfo.guest.splice(
      scheduleInfo.guest.indexOf({
        nickname: userInfo.id,
        record: recordInfo ? recordInfo.id : '',
      }),
      1,
    );

    const updatedSchedule = await this.scheduleModel.findByIdAndUpdate(
      _id,
      scheduleInfo,
    );

    const guest: Guest[] = await Promise.all(
      updatedSchedule.guest.map(async (guest) => {
        const userInfo = await this.userModel.findById(guest.nickname);
        const recordInfo = await this.recordModel.findById(guest.record).exec();

        return {
          nickname: userInfo.nickname,
          record: recordInfo ? recordInfo.records : [],
        };
      }),
    );
    if (updatedSchedule.group) {
      updatedSchedule.group = (
        await this.groupModel.findById(updatedSchedule.group)
      ).gname;
    }

    return { ...updatedSchedule, guest };
  }

  async inviteSchedule(
    _id: string,
    email: string,
    guest: string,
  ): Promise<ReturnSchedule> {
    // catecory, spot, when, host, guest{nickname, record}, memo, group

    // 일정의 게스트 목록에 추가
    // 참여한 사람의 일정 목록에 추가

    const userInfo = await this.userModel.findById(guest);
    const scheduleInfo = await this.scheduleModel.findById(_id);

    await this.userModel.findByIdAndUpdate(guest, {
      myScheduleList: [...userInfo.myScheduleList, _id],
    });
    await this.scheduleModel.findByIdAndUpdate(_id, {
      guest: [...scheduleInfo.guest, { nickname: userInfo.id, record: '' }],
    });

    const newGuest: Guest = {
      nickname: userInfo.nickname,
      record: [],
    };
    const updatedGuest: Guest[] = await Promise.all(
      scheduleInfo.guest.map(async (guest) => {
        const userInfo = await this.userModel.findById(guest.nickname);
        const recordInfo = await this.recordModel.findById(guest.record).exec();

        return {
          nickname: userInfo.nickname,
          record: recordInfo ? recordInfo.records : [],
        };
      }),
    );
    updatedGuest.push(newGuest);

    if (scheduleInfo.group) {
      scheduleInfo.group = (
        await this.groupModel.findById(scheduleInfo.group)
      ).gname;
    }

    return { ...scheduleInfo, guest: [...updatedGuest] };
  }

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
