import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { LoginInput, User, UserEmail, UserInfo } from 'src/schemas/user.schema';

@Injectable()
export class UserService {
  constructor(
    @Inject('USER_MODEL')
    private userModel: Model<User>,
  ) {}

  async getMyPage(user: UserEmail): Promise<UserInfo> {
    const { email } = user;

    try {
      return await this.userModel.findOne({ email });
    } catch (err) {
      throw err;
    }
  }

  async login(user: LoginInput): Promise<User> {
    const { email, nickname } = user;

    try {
      const userInfo = await this.userModel.exists({ email, nickname });

      if (userInfo === null) {
        await this.userModel.create({
          email,
          nickname,
          myGroupList: [],
          myScheduleList: [],
        });
      }

      return await this.userModel.findOne({ email });
    } catch (err) {
      throw err;
    }
  }
}
