import { Inject, Injectable } from '@nestjs/common';
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

    try {
      return await this.userModel.findOne({ email });
    } catch (err) {
      throw err;
    }
  }
}
