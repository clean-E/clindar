import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import {
  ChangeLeaderInput,
  CreateGroupInput,
  DeleteGroupInput,
  Group,
  GroupId,
  GroupPassword,
  JoinGroupInput,
  LeaveGroupInput,
  Message,
} from 'src/schemas/group.schema';
import { User } from 'src/schemas/user.schema';
import bcrypt from 'bcrypt';

import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({
  path: path.resolve('.development.env'),
});

@Injectable()
export class GroupService {
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
      throw err;
    }
  }

  async getGroupDetail(group: GroupId): Promise<Group> {
    const { _id } = group;
    try {
      return await this.groupModel.findOne({ _id });
    } catch (err) {
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
        return await this.groupModel.findOne({ _id });
      } else {
        throw new Error('Wrong Password');
      }
    } catch (err) {
      throw err;
    }
  }

  async createGroup(group: CreateGroupInput): Promise<Group> {
    const {
      email,
      gname,
      leader,
      createdAt,
      mainCategory,
      description,
      secret,
      password,
    } = group;
    const groupSchema = {
      gname,
      leader,
      createdAt,
      description,
      memberList: [leader],
      mainCategory,
      secret,
      password: await bcrypt.hash(password, Number(process.env.SALT)),
      schedules: [],
    };

    try {
      const groupExist = await this.groupModel.exists({ gname });
      if (groupExist !== null) {
        throw new Error('Group name Already Exists');
      }
      const userInfo = await this.userModel.findOne({ email });
      await this.userModel.updateOne(
        { email },
        { myGroupList: [...userInfo.myGroupList, gname] },
      );
      return await this.groupModel.create(groupSchema);
    } catch (err) {
      throw err;
    }
  }

  async joinGroup(group: JoinGroupInput): Promise<Group> {
    const { email, _id } = group;

    try {
      const userInfo = await this.userModel.findOne({ email });
      const groupInfo = await this.groupModel.findOne({ _id });
      await this.userModel.updateOne(
        { email },
        { myGroupList: [...userInfo.myGroupList, groupInfo.gname] },
      );
      await this.groupModel.updateOne(
        { _id },
        { memberList: [...groupInfo.memberList, userInfo.nickname] },
      );

      return await this.groupModel.findOne({ _id });
    } catch (err) {
      throw err;
    }
  }

  async leaveGroup(group: LeaveGroupInput): Promise<Group> {
    const { email, _id } = group;

    try {
      const userInfo = await this.userModel.findOne({ email });
      const groupInfo = await this.groupModel.findOne({ _id });

      await this.userModel.updateOne(
        { email },
        {
          myGroupList: userInfo.myGroupList.splice(
            userInfo.myGroupList.indexOf(groupInfo.gname),
            1,
          ),
        },
      );

      await this.groupModel.updateOne(
        { _id },
        {
          memberList: groupInfo.memberList.splice(
            groupInfo.memberList.indexOf(userInfo.nickname),
            1,
          ),
        },
      );

      return await this.groupModel.findOne({ _id });
    } catch (err) {
      throw err;
    }
  }

  async deleteGroup(group: DeleteGroupInput): Promise<Message> {
    const { email, _id } = group;

    try {
      const { nickname } = await this.userModel.findOne({ email });
      const { gname, leader, memberList } = await this.groupModel.findOne({
        _id,
      });
      if (nickname !== leader) {
        return { value: 'not the owner of the group.' };
      }

      for (const nickname of memberList) {
        const { myGroupList } = await this.userModel.findOne({ nickname });
        await this.userModel.updateOne(
          { nickname },
          {
            myGroupList: myGroupList.splice(myGroupList.indexOf(gname), 1),
          },
        );
      }

      await this.groupModel.deleteOne({ _id });

      return { value: 'Success delete group' };
    } catch (err) {
      throw err;
    }
  }

  async changeLeader(group: ChangeLeaderInput): Promise<Group> {
    const { _id, leader, nextLeader } = group;

    try {
      const groupInfo = await this.groupModel.findOne({ _id });
      if (groupInfo.leader === leader) {
        return await this.groupModel.findOneAndUpdate(
          { _id },
          { leader: nextLeader },
        );
      } else {
        throw new Error('You are not the group leader.');
      }
    } catch (err) {
      throw err;
    }
  }
}
