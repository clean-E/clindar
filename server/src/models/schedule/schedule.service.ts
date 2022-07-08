import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Group } from 'src/schemas/group.schema';
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

      return newSchedule;
    } catch (err) {
      throw err;
    }
  }

  async deleteSchedule(schedule: DeleteScheduleInput): Promise<string> {
    // group의 schedules에서 삭제
    // myScheduleList 에서 삭제
    // schedule에서 삭제
    const { _id, email } = schedule;
    try {
      const { group } = await this.scheduleModel.findOne({ _id });
      for (let i = 0; i < group.length; i++) {
        const g = await this.groupModel.findOne({ gname: group[i].gname });
        g.schedules.splice(g.schedules.indexOf(_id), 1);
        await this.groupModel.updateOne(
          { gname: group[i].gname },
          { schedules: g.schedules },
        );
      }

      const { myScheduleList } = await this.userModel.findOne({ email });
      myScheduleList.splice(myScheduleList.indexOf(_id), 1);
      await this.userModel.updateOne({ email }, { myScheduleList });

      await this.scheduleModel.deleteOne({ _id });

      return 'Success';
    } catch (err) {
      throw err;
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

      return await this.scheduleModel.findOne({ _id });
    } catch (err) {
      throw err;
    }
  }

  async joinSchedule(schedule: JoinScheduleInput): Promise<Schedule> {
    const { _id, email, nickname } = schedule;
    try {
      const { who } = await this.scheduleModel.findOne({ _id });

      who.guest.push({ nickname, record: [] });
      await this.scheduleModel.updateOne({ _id }, { who });

      return await this.scheduleModel.findOne({ _id });
    } catch (err) {
      throw err;
    }
  }

  // async editRecord(schedule: EditRecordInput): Promise<Schedule> {}
}
