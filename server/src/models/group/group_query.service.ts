import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Group, ReturnGroup } from 'src/schemas/group.schema';
import { Result, User } from 'src/schemas/user.schema';
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

  async checkDuplicateGroupName(gname: string): Promise<Result> {
    const duplicateCheck = await this.groupModel.exists({ gname });
    return { success: duplicateCheck ? false : true };
  }

  // 멤버, 일정이 id로 되어있으니 바꿔서 반환
  async getAllGroup(): Promise<Group[]> {
    // _id, gname, mainCategory, age, secret
    const groups = await this.groupModel.find();

    return groups;
  }

  async getMyGroup(email: string): Promise<Group[]> {
    const userInfo = await this.userModel.findOne({ email });
    const myGroupList = await Promise.all(
      userInfo.myGroupList.map(async (group) => {
        return await this.groupModel.findById(group);
      }),
    );

    return myGroupList;
  }

  // async getGroupDetail(group: GroupId): Promise<Group> {
  //
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
}
