import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Group } from 'src/schemas/group.schema';
import { User } from 'src/schemas/user.schema';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { ApolloError } from 'apollo-server-express';

dotenv.config({
  path: path.resolve('.development.env'),
});

@Injectable()
export class GroupQuery {
  constructor(
    @Inject('GROUP_MODEL')
    private groupModel: Model<Group>,

    @Inject('USER_MODEL')
    private userModel: Model<User>,
  ) {}

  // 멤버, 일정이 id로 되어있으니 바꿔서 반환
  // async getAllGroup(): Promise<Group[]> {
  //   try {
  //     return await this.groupModel.find();
  //   } catch (err) {
  //     console.log(err);
  //     throw new ApolloError('DB Error', 'DB_ERROR');
  //   }
  // }

  // async getMyGroup(group: UserEmail): Promise<Group[]> {
  //   try {
  //     const { email } = group;
  //     const { myGroupList } = await this.userModel.findOne({ email });
  //     const myGroup = [];
  //     for (const id of myGroupList) {
  //       const groupInfo = await this.groupModel.findOne({ id });
  //       myGroup.push(groupInfo);
  //     }

  //     return myGroup;
  //   } catch (err) {
  //     console.log(err);
  //     throw new ApolloError('DB Error', 'DB_ERROR');
  //   }
  // }

  // async getGroupDetail(group: GroupId): Promise<Group> {
  //   const { _id } = group;
  //   try {
  //     return await this.groupModel.findOne({ _id });
  //   } catch (err) {
  //     console.log(err);
  //     throw new ApolloError('DB Error', 'DB_ERROR');
  //   }
  // }

  // async openSecretGroup(group: GroupPassword): Promise<Group> {
  //   const { _id, password } = group;
  //   try {
  //     const groupInfo = await this.groupModel.findOne({ _id });
  //     const passwordCompareResult = await bcrypt.compare(
  //       password,
  //       groupInfo.password,
  //     );
  //     if (passwordCompareResult) {
  //       const groupInfo = await this.groupModel.findOne({ _id });
  //       groupInfo.success = true;
  //       return groupInfo;
  //     } else {
  //       let groupInfo: Group;
  //       groupInfo.success = false;
  //       return groupInfo;
  //     }
  //   } catch (err) {
  //     console.log(err);
  //     throw new ApolloError('DB Error', 'DB_ERROR');
  //   }
  // }

  // async getMemberName(memberList: string[]): Promise<string[]> {
  //   const memberName = [];
  //   for (const memberId of memberList) {
  //     const { nickname } = await this.userModel.findOne({ id: memberId });
  //     memberList.push(nickname);
  //   }
  //   return memberName;
  // }

  // async getSchedulesOfMembers(schedules: string[]): Promise<Schedule[]> {

  // }
}
