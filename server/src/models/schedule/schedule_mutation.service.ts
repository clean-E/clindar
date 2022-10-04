import { Inject, Injectable } from '@nestjs/common';
import { ApolloError } from 'apollo-server-express';
import { Model, ObjectId } from 'mongoose';
import { Group, Message } from 'src/schemas/group.schema';
import {
  DeleteScheduleInput,
  EditRecordInput,
  ComeoutScheduleInput,
  Schedule,
  CreateScheduleInput,
  EditScheduleInput,
  JoinScheduleInput,
  ReturnSchedule,
  Guest,
  InviteScheduleInput,
} from 'src/schemas/schedule.schema';
import { User } from 'src/schemas/user.schema';
import { Record } from 'src/schemas/record.schema';

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
    private recordModel: Model<Record>,
  ) {}

  async createSchedule(schedule: CreateScheduleInput): Promise<ReturnSchedule> {
    /*
    1. 들어온 데이터 중 string에서 object id로 바꿔야하는 것들을 바꿈
    2. 일정 document 생성
    3. 새로 생성된 일정 데이터를 불러옴
    4. 게스트들의 일정 리스트에 id 추가
    5. 그룹의 일정 리스트에 id 추가
    6. object id에서 string으로 바꿔야하는 것들을 다시 바꾸고 반환
    */

    const { email } = schedule;
    delete schedule.email;

    try {
      //1. 들어온 데이터 중 string에서 object id로 바꿔야하는 것들을 바꿈
      for (let idx = 0; idx < schedule.who.guest.length; idx++) {
        const guestInfo = await this.userModel.findOne({
          nickname: schedule.who.guest[idx].nickname,
        });

        if (idx === 0) {
          schedule.who.host = guestInfo._id;
        }

        schedule.who.guest[idx].nickname = guestInfo._id;
        schedule.who.guest[idx].record = null;
      }

      if (schedule.group) {
        schedule.group = (
          await this.groupModel.findOne({
            gname: schedule.group,
          })
        )._id;
      }

      //2. 일정 document 생성
      //3. 새로 생성된 일정 데이터를 불러옴
      const newSchedule = await this.scheduleModel.create(schedule);

      //4. 게스트들의 일정 리스트에 id 추가
      for (const guest of schedule.who.guest) {
        const guestInfo = await this.userModel.findById(guest.nickname);
        await this.userModel.findOneAndUpdate(
          { nickname: guestInfo.nickname },
          {
            myScheduleList: [...guestInfo.myScheduleList, newSchedule._id],
          },
        );
      }
      //5. 그룹의 일정 리스트에 id 추가
      if (schedule.group) {
        const groupInfo = await this.groupModel.findById(schedule.group);
        await this.groupModel.findByIdAndUpdate(schedule.group, {
          schedules: [...groupInfo.schedules, newSchedule._id],
        });

        newSchedule.group = groupInfo.gname;
      }
      //6. object id에서 string으로 바꿔야하는 것들을 다시 바꾸고 반환
      //host, guest nickname

      const returnSchedule: ReturnSchedule = await this.makeReturnSchedule(
        newSchedule,
      );

      return returnSchedule;
    } catch (err) {
      console.log(err);
      throw new ApolloError('DB Error', 'DB_ERROR');
    }
  }

  async deleteSchedule(schedule: DeleteScheduleInput): Promise<Message> {
    // group의 schedules에서 삭제
    // guest에 있는 모든 사람의 목록에서 일정 id 삭제
    // schedule에서 삭제
    const { _id, email } = schedule;
    try {
      const scheduleInfo = await this.scheduleModel.findOne({ _id });
      const userInfo = await this.userModel.findOne({ email });
      if (userInfo.nickname !== scheduleInfo.who.host) {
        throw '일정의 호스트가 아닙니다.';
      }
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

      return { message: '일정 삭제 성공', success: true };
    } catch (err) {
      console.log(err);
      return { message: err, success: false };
    }
  }

  async editSchedule(schedule: EditScheduleInput): Promise<ReturnSchedule> {
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

      const scheduleInfo = await this.scheduleModel.findOne({ _id });
      return await this.makeReturnSchedule(scheduleInfo);
    } catch (err) {
      console.log(err);
      throw new ApolloError('DB Error', 'DB_ERROR');
    }
  }

  async joinSchedule(schedule: JoinScheduleInput): Promise<ReturnSchedule> {
    // 내 일정 목록 업데이트, 일정 게스트 목록 업데이트
    // returnSchedule 생성
    const { _id, nickname } = schedule;
    try {
      // 내 일정 목록 업데이트
      const userInfo = await this.userModel.findOne({ nickname });
      await this.userModel.updateOne(
        { nickname },
        { myScheduleList: [...userInfo.myScheduleList, _id] },
      );

      // 일정 게스트 목록 업데이트
      const scheduleInfo = await this.scheduleModel.findOne({ _id });
      scheduleInfo.who.guest.push({ nickname: userInfo.id, record: null });

      await this.scheduleModel.updateOne({ _id }, scheduleInfo);

      const newScheduleInfo = await this.scheduleModel.findOne({ _id });

      return await this.makeReturnSchedule(newScheduleInfo);
    } catch (err) {
      console.log(err);
      throw new ApolloError('DB Error', 'DB_ERROR');
    }
  }

  async inviteSchedule(schedule: InviteScheduleInput): Promise<ReturnSchedule> {
    // 초대된 사람 일정 목록 업데이트, 일정 게스트 목록 업데이트
    // returnSchedule 생성
    const { _id, nickname } = schedule;
    try {
      // 내 일정 목록 업데이트
      const userInfo = await this.userModel.findOne({ nickname });
      await this.userModel.updateOne(
        { nickname },
        { myScheduleList: [...userInfo.myScheduleList, _id] },
      );

      // 일정 게스트 목록 업데이트
      const scheduleInfo = await this.scheduleModel.findOne({ _id });
      scheduleInfo.who.guest.push({ nickname: userInfo.id, record: null });

      await this.scheduleModel.updateOne({ _id }, scheduleInfo);

      const newScheduleInfo = await this.scheduleModel.findOne({ _id });

      return await this.makeReturnSchedule(newScheduleInfo);
    } catch (err) {
      console.log(err);
      throw new ApolloError('DB Error', 'DB_ERROR');
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
        if (scheduleInfo.who.guest[i].nickname === userInfo.id) {
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
        const recordSchema = {
          sId: _id,
          uId: userInfo.id,
          records: record,
        };
        const newRecord = await this.recordModel.create(recordSchema);
        const scheduleInfo = await this.scheduleModel.findOne({ _id });
        for (let i = 0; i < scheduleInfo.who.guest.length; i++) {
          if (scheduleInfo.who.guest[i].nickname === nickname) {
            scheduleInfo.who.guest[i].record = newRecord.id;
            break;
          }
        }
        await this.scheduleModel.updateOne({ _id }, { who: scheduleInfo.who });
        await this.userModel.updateOne(
          { nickname },
          { records: [...userInfo.records, newRecord.id] },
        );
      }

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
    if (group === '') {
      editGroup = await this.groupModel.findOne({ id: group });
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
