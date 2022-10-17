import { Inject, Injectable } from '@nestjs/common';
import { ApolloError } from 'apollo-server-express';
import { Model } from 'mongoose';
import { User } from 'src/schemas/user.schema';

@Injectable()
export class UserQuery {
  constructor(
    @Inject('USER_MODEL')
    private userModel: Model<User>,
  ) {}

  // 내 기록을 모아서 볼 수 있도록 - 암장별 기록
  async getMyPage(email: string): Promise<User> {
    const userInfo = await this.userModel.findOne({ email });

    // 그룹 목록, 기록 정리해서 반환
    if (userInfo) {
      return userInfo;
    } else {
      throw new ApolloError('Not Found User', 'NOT_FOUND_USER');
    }
  }
}
