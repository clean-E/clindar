import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { ImageUrlInput } from 'src/schemas/group.schema';
import {
  LoginInput,
  NicknameInput,
  User,
  UserEmail,
} from 'src/schemas/user.schema';

@Injectable()
export class UserService {
  constructor(
    @Inject('USER_MODEL')
    private userModel: Model<User>,
  ) {}

  async login(user: LoginInput): Promise<User> {
    const { email, nickname } = user;

    try {
      const userInfo = await this.userModel.exists({ email });

      if (userInfo === null) {
        // 회원 정보가 없음
        await this.userModel.create({
          email,
          nickname,
          myGroupList: [],
          myScheduleList: [],
          records: [],
        });
      }
      return await this.userModel.findOne({ email });
    } catch (err) {
      throw err;
    }
  }

  async setNickname(user: NicknameInput): Promise<User> {
    const { email, nickname } = user;
    try {
      const userInfo = await this.userModel.exists({ nickname });

      if (userInfo === null) {
        // 사용 가능한 닉네임
        await this.userModel.updateOne({ email }, { nickname });
      }

      return await this.userModel.findOne({ email });
    } catch (err) {
      throw err;
    }
  }

  async getMyPage(user: UserEmail): Promise<User> {
    const { email } = user;

    try {
      return await this.userModel.findOne({ email });
    } catch (err) {
      throw err;
    }
  }

  /*
  async changeUserImage(user: ImageUrlInput): Promise<User> {

  }
  */

  /*
  async deleteUser(user: UserEmail): Promise<Message> {

  }
  */
}
