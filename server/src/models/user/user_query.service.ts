import { Inject, Injectable } from '@nestjs/common';
import { ApolloError } from 'apollo-server-express';
import { Model } from 'mongoose';
import { Records } from 'src/schemas/record.schema';
import { Schedule } from 'src/schemas/schedule.schema';
import { ReturnUser, User } from 'src/schemas/user.schema';

@Injectable()
export class UserQuery {
  constructor(
    @Inject('USER_MODEL')
    private userModel: Model<User>,
    @Inject('RECORD_MODEL')
    private recordModel: Model<Records>,
    @Inject('SCHEDULE_MODEL')
    private scheduleModel: Model<Schedule>,
  ) {}

  // 내 기록을 모아서 볼 수 있도록 - 암장별 기록
  // async getMyPage(email: string): Promise<ReturnUser> {
  //   const { nickname, myRecord } = await this.userModel.findOne({ email });

  //   const records = {};
  //   await Promise.all(
  //     myRecord.map(async (id) => {
  //       const recordInfo = await this.recordModel.findById(id);
  //       const scheduleInfo = await this.scheduleModel.findById(recordInfo.sId);
  //       const spotName = scheduleInfo.spot;
  //     }),
  //   );
  // }

  async getAllUser(): Promise<User[]> {
    return await this.userModel.find();
  }
}
