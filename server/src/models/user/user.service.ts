import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { User } from 'src/schemas/user.schema';

@Injectable()
export class UserService {
  constructor(
    @Inject('USER_MODEL')
    private userModel: Model<User>,
  ) {}

  async getMyPage(): Promise<User> {
    const result = await this.userModel.find();
    console.log(result);

    return await this.userModel
      .findOne({
        email: 'leguyong@naver.com',
      })
      .exec();
  }

  async login(): Promise<User> {
    const email = 'leguyong@naver.com';
    const nickname = 'jy';

    const user = {
      email,
      nickname,
    };

    await this.userModel.create(user);

    return await this.userModel.findOne(user);
  }
}
