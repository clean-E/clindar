import { Inject, Injectable } from '@nestjs/common';
import { ApolloError } from 'apollo-server-express';
import { Model } from 'mongoose';
import { User, UserEmail } from 'src/schemas/user.schema';

@Injectable()
export class UserQuery {
  constructor(
    @Inject('USER_MODEL')
    private userModel: Model<User>,
  ) {}

  // 내 기록을 모아서 볼 수 있도록 - 암장별 기록
  async getMyPage(user: UserEmail): Promise<User> {
    const { email } = user;

    const userInfo = await this.userModel.findOne({ email });

    if (userInfo) {
      return userInfo;
    } else {
      throw new ApolloError('Not Found User');
    }
  }
}
