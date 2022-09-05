import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { LoginInput, NicknameInput, User } from 'src/schemas/user.schema';

@Injectable()
export class UserMutation {
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
          image: '',
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

  /*
  async deleteUser(user: UserEmail): Promise<Message> {

  }
  */
}