import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { LoginInput, NicknameInput, User } from 'src/schemas/user.schema';
import { ApolloError } from 'apollo-server-express';

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
        // 회원 정보가 없음, 첫 로그인
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
      console.log(err);
      throw new ApolloError('DB Error', 'DB_ERROR');
    }
  }

  async setNickname(user: NicknameInput): Promise<User> {
    const { email, nickname } = user;
    try {
      const userInfo = await this.userModel.exists({ nickname });

      if (userInfo === null) {
        // 사용 가능한 닉네임
        const changeNickname = await this.userModel.findOneAndUpdate(
          { email },
          { nickname },
        );
        changeNickname.nickname = nickname;
        changeNickname.success = true;
        return changeNickname;
      } else {
        const failChangeNickname = await this.userModel.findOne({ email });
        failChangeNickname.success = false;
        return failChangeNickname;
      }
    } catch (err) {
      console.log(err);
      throw new ApolloError('DB Error', 'DB_ERROR');
    }
  }

  /*
  async deleteUser(user: UserEmail): Promise<Message> {
    // 탈퇴할 때 삭제되어야 할 내용
    // 내 일정 조회 -> 기록 삭제 -> 일정에서 삭제 
    // (호스트인 경우 다음 사람에게 넘겨주고 본인만 삭제, 혼자면 일정 자체를 삭제)
    // 내 그룹 조회 -> 그룹 멤버에서 삭제
    // (리더인 경우 다음 사람에게 넘겨주고 본인만 삭제, 혼자면 그룹 자체를 삭제)
  }
  */
}
