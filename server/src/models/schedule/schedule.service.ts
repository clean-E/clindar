import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Group, Message } from 'src/schemas/group.schema';
import {
  DeleteScheduleInput,
  EditRecordInput,
  InviteScheduleInput,
  Schedule,
  ScheduleId,
} from 'src/schemas/schedule.schema';
import { User, UserEmail } from 'src/schemas/user.schema';
import {
  CreateScheduleInput,
  EditScheduleInput,
  JoinScheduleInput,
} from '../../schemas/schedule.schema';

@Injectable()
export class ScheduleService {
  constructor(
    @Inject('SCHEDULE_MODEL')
    private scheduleModel: Model<Schedule>,

    @Inject('USER_MODEL')
    private userModel: Model<User>,

    @Inject('GROUP_MODEL')
    private groupModel: Model<Group>,
  ) {}

  async getAllSchedule(schedule: UserEmail): Promise<Schedule[]> {
    try {
      const { email } = schedule;
      const { myGroupList, myScheduleList } = await this.userModel.findOne({
        email,
      });

      const allSchedule = {};

      for (let i = 0; i < myScheduleList.length; i++) {
        const s = await this.scheduleModel.findOne({ _id: myScheduleList[i] });
        allSchedule[myScheduleList[i]] = s;
      }

      for (let i = 0; i < myGroupList.length; i++) {
        const { schedules } = await this.groupModel.findOne({
          gname: myGroupList[i],
        });
        for (let j = 0; j < schedules.length; j++) {
          const s = await this.scheduleModel.findOne({ _id: schedules[i] });
          allSchedule[schedules[i]] = s;
        }
      }

      return Object.values(allSchedule);
    } catch (err) {
      throw err;
    }
  }

  async getScheduleDetail(schedule: ScheduleId): Promise<Schedule> {
    const { _id } = schedule;
    try {
      return await this.scheduleModel.findOne({ _id });
    } catch (err) {
      throw err;
    }
  }

  async createSchedule(schedule: CreateScheduleInput): Promise<Schedule> {
    const { email } = schedule;
    delete schedule.email;

    try {
      const userInfo = await this.userModel.findOne({ email });

      const newSchedule = await this.scheduleModel.create(schedule);
      userInfo.myScheduleList.push(newSchedule.id.toString());

      await this.userModel.updateOne(
        { email },
        { myScheduleList: userInfo.myScheduleList },
      );

      if (schedule.group) {
        const gInfo = await this.groupModel.findOne({ gname: schedule.group });
        await this.groupModel.findOneAndUpdate(
          { gname: schedule.group },
          { schedules: [...gInfo.schedules, newSchedule.id] },
        );
      }

      return newSchedule;
    } catch (err) {
      throw err;
    }
  }

  async deleteSchedule(schedule: DeleteScheduleInput): Promise<Message> {
    // group의 schedules에서 삭제
    // myScheduleList 에서 삭제
    // schedule에서 삭제
    const { _id, email } = schedule;
    try {
      const { group } = await this.scheduleModel.findOne({ _id });

      const gInfo = await this.groupModel.findOne({ gname: group });
      gInfo.schedules.splice(gInfo.schedules.indexOf(_id), 1);
      await this.groupModel.updateOne(
        { gname: group },
        { schedules: gInfo.schedules },
      );

      const { myScheduleList } = await this.userModel.findOne({ email });
      myScheduleList.splice(myScheduleList.indexOf(_id), 1);
      await this.userModel.updateOne({ email }, { myScheduleList });

      await this.scheduleModel.deleteOne({ _id });

      return { value: 'Success delete schedule' };
    } catch (err) {
      throw err;
    }

    // guest로 있는 사람들의 일정에서도 지워야함
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
      /*
      const sInfo = await this.scheduleModel.findOne({ _id });
      // 그룹이 바뀐 경우
      if (sInfo.group !== schedule.group){
        // 기존 그룹의 일정 목록에서 제거
        // 바뀐 그룹의 일정 목록에 추가

      }
      // 게스트 목록 비교해서 빠진 사람, 추가된 사람 체크
      // 빠진 사람은 그 사람의 일정 목록에서 일정 제거
      // 추가된 사람은 일정 목록에 추가
      */
      await this.scheduleModel.findOneAndUpdate({ _id }, schedule);

      return await this.scheduleModel.findOne({ _id });
    } catch (err) {
      throw err;
    }
  }

  async inviteSchedule(schedule: InviteScheduleInput): Promise<Schedule> {
    const { _id, email, nickname } = schedule;
    try {
      const hostInfo = await this.userModel.findOne({ email });
      const host = hostInfo.nickname;

      const { who } = await this.scheduleModel.findOne({ _id });

      if (who.host !== host) {
        throw new Error();
      }
      who.guest.push({ nickname, record: [] });
      await this.scheduleModel.updateOne({ _id }, { who });

      const guestInfo = await this.userModel.findOne({ nickname });
      guestInfo.myScheduleList.push(_id);

      return await this.scheduleModel.findOne({ _id });
    } catch (err) {
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
      throw err;
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
        }
      }

      scheduleInfo.who.guest = guestInfo;

      await this.scheduleModel.updateOne({ _id }, { who: scheduleInfo.who });

      return await this.scheduleModel.findOne({ _id });
    } catch (err) {
      throw err;
    }
  }
}
