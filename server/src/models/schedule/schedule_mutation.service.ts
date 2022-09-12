import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Group, Message } from 'src/schemas/group.schema';
import {
  DeleteScheduleInput,
  EditRecordInput,
  ComeoutScheduleInput,
  Schedule,
  CreateScheduleInput,
  EditScheduleInput,
  JoinScheduleInput,
} from 'src/schemas/schedule.schema';
import { User } from 'src/schemas/user.schema';

@Injectable()
export class ScheduleMutation {
  constructor(
    @Inject('SCHEDULE_MODEL')
    private scheduleModel: Model<Schedule>,

    @Inject('USER_MODEL')
    private userModel: Model<User>,

    @Inject('GROUP_MODEL')
    private groupModel: Model<Group>,
  ) {}

  async createSchedule(schedule: CreateScheduleInput): Promise<Schedule> {
    const { email } = schedule;
    delete schedule.email;

    try {
      const newSchedule = await this.scheduleModel.create(schedule);

      for (const g of schedule.who.guest) {
        const guestInfo = await this.userModel.findOne({
          nickname: g.nickname,
        });
        await this.userModel.findOneAndUpdate(
          { nickname: g.nickname },
          {
            myScheduleList: [
              ...guestInfo.myScheduleList,
              newSchedule._id.toString(),
            ],
          },
        );
      }

      if (schedule.group) {
        const gInfo = await this.groupModel.findOne({ gname: schedule.group });
        await this.groupModel.findOneAndUpdate(
          { gname: schedule.group },
          { schedules: [...gInfo.schedules, newSchedule.id] },
        );
      }

      return newSchedule;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async deleteSchedule(schedule: DeleteScheduleInput): Promise<Message> {
    // group의 schedules에서 삭제
    // guest에 있는 모든 사람의 목록에서 일정 id 삭제
    // schedule에서 삭제
    const { _id, email } = schedule;
    try {
      const scheduleInfo = await this.scheduleModel.findOne({ _id });
      const groupExist = await this.groupModel.exists({
        gname: scheduleInfo.group,
      });
      if (groupExist !== null) {
        const groupInfo = await this.groupModel.findOne({
          gname: scheduleInfo.group,
        });
        groupInfo.schedules.splice(groupInfo.schedules.indexOf(_id), 1);
        await this.groupModel.updateOne(
          { gname: scheduleInfo.group },
          {
            schedules: groupInfo.schedules,
          },
        );
      }

      for (const guest of scheduleInfo.who.guest) {
        const { myScheduleList } = await this.userModel.findOne({
          nickname: guest.nickname,
        });
        myScheduleList.splice(myScheduleList.indexOf(_id), 1);
        await this.userModel.updateOne(
          { nickname: guest.nickname },
          {
            myScheduleList,
          },
        );
      }

      await this.scheduleModel.deleteOne({ _id });

      return { message: 'Successed delete schedule', success: true };
    } catch (err) {
      console.log(err);
      return { message: 'Failed delete schedule', success: false };
    }
  }

  async editSchedule(schedule: EditScheduleInput): Promise<Schedule> {
    const { email, _id } = schedule;
    delete schedule.email;
    delete schedule._id;

    try {
      const userInfo = await this.userModel.exists({ email });
      if (userInfo === null) {
        throw new Error('User Not Found');
      }

      // 수정하면서 게스트, 그룹이 바뀌었을 경우를 처리해줘야함

      const sInfo = await this.scheduleModel.findOne({ _id });
      // 그룹이 바뀐 경우
      // sInfo.group -> 기존 그룹
      // schedule.group -> 수정된 그룹 (변경되었다면)
      if (sInfo.group !== schedule.group) {
        // 기존 그룹의 일정 목록에서 제거
        const groupInfo = await this.groupModel.findOne({ gname: sInfo.group });
        groupInfo.schedules.splice(groupInfo.schedules.indexOf(_id), 1);
        await this.groupModel.updateOne(
          { gname: sInfo.group },
          {
            schedules: groupInfo.schedules,
          },
        );
        // 바뀐 그룹의 일정 목록에 추가
        const newGroupInfo = await this.groupModel.findOne({
          gname: schedule.group,
        });
        await this.groupModel.findOneAndUpdate(
          { gname: schedule.group },
          { schedules: [...newGroupInfo.schedules, _id] },
        );
      }

      /*
      // 게스트 목록 비교해서 빠진 사람, 추가된 사람 체크
      // 빠진 사람은 그 사람의 일정 목록에서 일정 제거
      // 추가된 사람은 일정 목록에 추가
      */
      const addedGuests = [];
      const canceledGuests = [];

      const existingGuests = {};
      const newGuests = {};
      for (const guest of sInfo.who.guest) {
        existingGuests[guest.nickname] = 1;
      }
      for (const guest of schedule.who.guest) {
        newGuests[guest.nickname] = 1;
      }

      // schedule.who.guest, newGuests -> 새로 들어온 게스트 목록
      // sInfo.who.guest, existingGuest -> 기존 게스트 목록
      for (const guest of schedule.who.guest) {
        if (!existingGuests.hasOwnProperty(guest.nickname)) {
          addedGuests.push(guest.nickname);
        }
      }

      for (const guest of sInfo.who.guest) {
        if (!newGuests.hasOwnProperty(guest.nickname)) {
          canceledGuests.push(guest.nickname);
        }
      }

      for (const nickname of addedGuests) {
        const guestInfo = await this.userModel.findOne({ nickname });
        await this.userModel.findOneAndUpdate(
          { nickname },
          {
            myScheduleList: [...guestInfo.myScheduleList, _id.toString()],
          },
        );
      }

      for (const nickname of canceledGuests) {
        const guestInfo = await this.userModel.findOne({ nickname });
        guestInfo.myScheduleList.splice(
          guestInfo.myScheduleList.indexOf(_id),
          1,
        );
        await this.userModel.findOneAndUpdate(
          { nickname },
          { myScheduleList: guestInfo.myScheduleList },
        );
      }

      await this.scheduleModel.findOneAndUpdate({ _id }, schedule);

      return await this.scheduleModel.findOne({ _id });
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async joinSchedule(schedule: JoinScheduleInput): Promise<Schedule> {
    const { _id, nickname } = schedule;
    try {
      const { who } = await this.scheduleModel.findOne({ _id });

      who.guest.push({ nickname, record: [] });
      await this.scheduleModel.updateOne({ _id }, { who });

      return await this.scheduleModel.findOne({ _id });
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async comeoutSchedule(schedule: ComeoutScheduleInput): Promise<Message> {
    const { _id, email } = schedule;

    try {
      const userInfo = await this.userModel.findOne({ email });
      const scheduleInfo = await this.scheduleModel.findOne({ _id });

      // 유저 스케쥴에서 제거
      userInfo.myScheduleList.splice(userInfo.myScheduleList.indexOf(_id), 1);
      await this.userModel.findOneAndUpdate(
        { email },
        { myScheduleList: userInfo.myScheduleList },
      );

      // 스케쥴의 게스트에서 제거
      for (let i = 0; i < scheduleInfo.who.guest.length; i++) {
        if (scheduleInfo.who.guest[i].nickname === userInfo.nickname) {
          scheduleInfo.who.guest.splice(i, 1);
          break;
        }
      }

      return { message: 'Succeeded in coming out of Schedule.', success: true };
    } catch (err) {
      console.log(err);
      return { message: 'Failed in coming out of Schedule.', success: false };
    }
  }

  async editRecord(schedule: EditRecordInput): Promise<Schedule> {
    const { _id, nickname, record } = schedule;

    try {
      const scheduleInfo = await this.scheduleModel.findOne({ _id });
      const guestInfo = scheduleInfo.who.guest;

      for (let i = 0; i < guestInfo.length; i++) {
        if (guestInfo[i].nickname === nickname) {
          guestInfo[i].record = [...record];
          break;
        }
      }
      scheduleInfo.who.guest = guestInfo;
      await this.scheduleModel.updateOne({ _id }, { who: scheduleInfo.who });

      const userInfo = await this.userModel.findOne({ nickname });
      let flag = true;
      for (let i = 0; i < userInfo.records.length; i++) {
        if (userInfo.records[i].sId === _id) {
          userInfo.records[i].record = [...record];
          await this.userModel.findOneAndUpdate(
            { nickname },
            { records: [...userInfo.records] },
          );
          flag = false;
          break;
        }
      }
      if (flag) {
        await this.userModel.findOneAndUpdate(
          { nickname },
          {
            records: [
              ...userInfo.records,
              {
                sId: _id,
                when: scheduleInfo.when,
                where: scheduleInfo.where,
                record,
              },
            ],
          },
        );
      }

      return await this.scheduleModel.findOne({ _id });
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
}
