import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Result, User, UserInput } from 'src/schemas/user.schema';
import { ApolloError } from 'apollo-server-express';

@Injectable()
export class UserMutation {
  constructor(
    @Inject('USER_MODEL')
    private userModel: Model<User>,
  ) {}

  async login(userInfo: UserInput): Promise<User> {
    const { email, nickname } = userInfo;

    const userExists = await this.userModel.exists({ email });

    if (userExists === null) {
      // 회원 정보가 없음, 첫 로그인 -> 유저 정보 생성
      await this.userModel.create({
        email,
        nickname,
        myGroupList: [],
        myScheduleList: [],
        myRecord: [],
      });
    }
    return await this.userModel.findOne({ email });
  }

  async setNickname(userInfo: UserInput): Promise<User> {
    const { email, nickname } = userInfo;

    const duplicateCheck = await this.userModel.exists({ nickname });

    if (duplicateCheck === null) {
      // 사용 가능한 닉네임
      const changeNickname = await this.userModel.findOneAndUpdate(
        { email },
        { nickname },
      );
      changeNickname.nickname = nickname;
      return changeNickname;
    } else {
      // 이미 있는 닉네임
      throw new ApolloError('중복된 닉네임', 'DUPLICATE_NICKNAME');
    }
  }

  // async deleteUser(email: string): Promise<Result> {
  //   const userInfo = await this.userModel.findOne({ email });

  //   return { success: true };
  // }
}
