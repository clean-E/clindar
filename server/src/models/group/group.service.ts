import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import {
  CreateGroupInput,
  DeleteGroupInput,
  Group,
  GroupId,
  GroupPassword,
  JoinGroupInput,
  LeaveGroupInput,
} from 'src/schemas/group.schema';
import { User } from 'src/schemas/user.schema';

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

  async openSecretGroup(group: GroupPassword): Promise<Group | string> {
    const { _id, password } = group;
    try {
      const groupInfo = await this.groupModel.findOne({ _id });
      if (groupInfo.password === password) {
        return await this.groupModel.findOne({ _id });
      } else {
        return 'Wrong Password';
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
      password,
      schedules: [],
    };

    try {
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

  async deleteGroup(group: DeleteGroupInput): Promise<string> {
    const { email, _id } = group;

    try {
      const { nickname } = await this.userModel.findOne({ email });
      const { gname, leader, memberList } = await this.groupModel.findOne({
        _id,
      });
      if (nickname !== leader) {
        return 'not the owner of the group.';
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

      return 'Success';
    } catch (err) {
      throw err;
    }
  }
}
