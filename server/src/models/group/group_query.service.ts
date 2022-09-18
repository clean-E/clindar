import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Group, GroupId, GroupPassword } from 'src/schemas/group.schema';
import { User, UserEmail } from 'src/schemas/user.schema';
import * as bcrypt from 'bcrypt';

import * as dotenv from 'dotenv';
import * as path from 'path';

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

  async getAllGroup(): Promise<Group[]> {
    try {
      return await this.groupModel.find();
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async getMyGroup(group: UserEmail): Promise<Group[]> {
    try {
      const { email } = group;
      const { myGroupList } = await this.userModel.findOne({ email });
      const myGroup = [];
      for (const gname of myGroupList) {
        const groupInfo = await this.groupModel.findOne({ gname });
        myGroup.push(groupInfo);
      }

      return myGroup;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async getGroupDetail(group: GroupId): Promise<Group> {
    const { _id } = group;
    try {
      return await this.groupModel.findOne({ _id });
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async openSecretGroup(group: GroupPassword): Promise<Group> {
    const { _id, password } = group;
    try {
      const groupInfo = await this.groupModel.findOne({ _id });
      const passwordCompareResult = await bcrypt.compare(
        password,
        groupInfo.password,
      );
      if (passwordCompareResult) {
        const groupInfo = await this.groupModel.findOne({ _id });
        groupInfo.success = true;
        return groupInfo;
      } else {
        let groupInfo: Group;
        groupInfo.success = false;
        return groupInfo;
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  // 응답에 result 추가 예정
}
