import { Inject, Injectable } from '@nestjs/common';
import { ApolloError } from 'apollo-server-express';
import { Model } from 'mongoose';
import { ReturnUser, User } from 'src/schemas/user.schema';

@Injectable()
export class UserQuery {
  constructor(
    @Inject('USER_MODEL')
    private userModel: Model<User>,
  ) {}

  // 내 기록을 모아서 볼 수 있도록 - 암장별 기록
  // async getMyPage(email: string): Promise<ReturnUser> {
  //   const { nickname, myRecord } = await this.userModel.findOne({ email });

  // }

  async getAllUser(): Promise<User[]> {
    return await this.userModel.find();
  }
}
