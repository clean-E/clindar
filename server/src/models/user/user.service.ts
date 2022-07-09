import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import {
  LoginInput,
  NicknameInput,
  User,
  UserEmail,
  UserInfo,
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
      const userInfo = await this.userModel.exists({ email, nickname });

      if (userInfo === null) {
        // 회원 정보가 없음. 닉네임을 정해야함
        await this.userModel.create({
          email,
          nickname,
          myGroupList: [],
          myScheduleList: [],
        });
        return await this.userModel.findOne({ email });
      }
      // 회원 정보가 있음. 로그인
      return await this.userModel.findOne({ email });
    } catch (err) {
      console.log(err);
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
      } else {
        // 사용 불가능한 닉네임
        return await this.userModel.findOne({ email });
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async getMyPage(user: UserEmail): Promise<UserInfo> {
    const { email } = user;

    try {
      return await this.userModel.findOne({ email });
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
}
