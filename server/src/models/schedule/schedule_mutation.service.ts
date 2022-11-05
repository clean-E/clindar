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
import { EditRecordInput, Records } from 'src/schemas/record.schema';
import { ApolloError } from 'apollo-server-express';

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
    // email, category, spot, when, host, guest, memo, group
    const { email } = schedule;
    delete schedule.email;

    const newSchedule = await this.scheduleModel.create(schedule);

    // guest{nickname, record}, group의 일정 목록에 추가
    const guest: Guest[] = await Promise.all(
      newSchedule.guest.map(async (guest) => {
        const userInfo = await this.userModel.findByIdAndUpdate(
          guest.nickname,
          {
            $push: { myScheduleList: newSchedule.id },
          },
        );
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

    return { _id: newSchedule.id, ...newSchedule, host, guest, group };
  }

  async editSchedule(schedule: EditScheduleInput): Promise<ReturnSchedule> {
    // email, category, spot, when, host, guest, memo, group
    // category, spot, when, memo, group
    const { email, _id } = schedule;
    delete schedule.email;
    delete schedule._id;

    const userInfo = await this.userModel.findOne({ email });
    const scheduleInfo = await this.scheduleModel.findById(_id);

    if (userInfo.id !== scheduleInfo.host) {
      throw new ApolloError('Not Owner', 'NOT_OWNER');
    }

    scheduleInfo.category = [...schedule.category];
    scheduleInfo.spot = schedule.spot;
    scheduleInfo.when = schedule.when;
    scheduleInfo.memo = schedule.memo;
    scheduleInfo.group = schedule.group;

    const editResult = await this.scheduleModel.findByIdAndUpdate(
      _id,
      scheduleInfo,
    );

    const host = userInfo.nickname;
    // guest{nickname, record}, group의 일정 목록에 추가
    const guest: Guest[] = await Promise.all(
      editResult.guest.map(async (guest) => {
        const userInfo = await this.userModel.findById(guest.nickname);
        const record = await this.recordModel.findById(guest.record);
        return {
          nickname: userInfo.nickname,
          record: record.records,
        };
      }),
    );
    const group = (await this.groupModel.findById(editResult.group)).gname;

    return { ...editResult, host, guest, group };
  }
  async deleteSchedule(_id: string, email: string): Promise<Result> {
    const scheduleInfo = await this.scheduleModel.findById(_id);
    const hostInfo = await this.userModel.findOne({ email });
    if (scheduleInfo.host !== hostInfo.id) {
      return { success: false };
    }

    // guest, group의 일정에서 제거
    const { guest, group } = await this.scheduleModel.findById(_id);

    for (let i = 0; i < guest.length; i++) {
      const { myScheduleList } = await this.userModel.findById(
        guest[i].nickname,
      );
      myScheduleList.splice(myScheduleList.indexOf(_id), 1);
      await this.userModel.findByIdAndUpdate(guest[i].nickname, {
        myScheduleList,
      });
    }

    if (group) {
      const groupInfo = await this.groupModel.findById(group);
      if (groupInfo) {
        const { schedules } = groupInfo;
        schedules.splice(schedules.indexOf(_id), 1);
        await this.groupModel.findByIdAndUpdate(group, {
          schedules,
        });
      }
    }

    await this.scheduleModel.deleteOne({ _id });

    return { success: true };
  }

  async joinSchedule(_id: string, email: string): Promise<ReturnSchedule> {
    // category, spot, when, host, guest{nickname, record}, memo, group

    // 일정의 게스트 목록에 추가
    // 참여한 사람의 일정 목록에 추가
    let userInfo;
    let scheduleInfo;
    try {
      userInfo = await this.userModel.findOne({ email });
      scheduleInfo = await this.scheduleModel.findById(_id);

      await this.userModel.findOneAndUpdate(
        { email },
        {
          myScheduleList: [...userInfo.myScheduleList, _id],
        },
      );
      await this.scheduleModel.findByIdAndUpdate(_id, {
        guest: [...scheduleInfo.guest, { nickname: userInfo.id, record: '' }],
      });
    } catch (e) {
      console.log(e);
      throw new ApolloError(e.Message);
    }

    const newGuest: Guest = {
      nickname: userInfo.nickname,
      record: [],
    };
    const guest: Guest[] = await Promise.all(
      scheduleInfo.guest.map(async (guest) => {
        const userInfo = await this.userModel.findById(guest.nickname);
        const recordInfo = await this.recordModel
          .findOne({ id: guest.record })
          .exec();

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

    return { _id: scheduleInfo.id, ...scheduleInfo, guest };
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
    // category, spot, when, host, guest{nickname, record}, memo, group

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

  async editRecord(records: EditRecordInput): Promise<ReturnSchedule> {
    const { email, _id } = records;
    delete records.email;
    delete records._id;

    const userInfo = await this.userModel.findOne({ email });
    const scheduleInfo = await this.scheduleModel.findById(_id);

    // 기록 생성 or 수정
    const recordExist = await this.recordModel.exists({
      sId: scheduleInfo.id,
      uId: userInfo.id,
    });
    if (!recordExist) {
      // 새로 생성 - 일정, 유저 업데이트
      const newRecord = await this.recordModel.create({
        sId: scheduleInfo.id,
        uId: userInfo.id,
        records: records.record,
      });
      await this.userModel.findOneAndUpdate(
        { email },
        { $push: { myRecord: newRecord.id } },
      );
      const updateGuestInfo = scheduleInfo.guest.map((guest) => {
        return guest.nickname === userInfo.id
          ? { nickname: guest.nickname, record: newRecord.id }
          : guest;
      });
      scheduleInfo.guest = updateGuestInfo;
      await this.scheduleModel.findByIdAndUpdate(_id, {
        guest: updateGuestInfo,
      });
    } else {
      // 수정 - 일정, 유저 업데이트 x
      await this.recordModel.findOneAndUpdate(
        { sId: scheduleInfo.id, uId: userInfo.id },
        { records: records.record },
      );
    }

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
