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
