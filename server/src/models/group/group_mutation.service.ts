import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import {
  ChangeLeaderInput,
  CreateGroupInput,
  DeleteGroupInput,
  Group,
  JoinGroupInput,
  LeaveGroupInput,
  Message,
} from 'src/schemas/group.schema';
import { User } from 'src/schemas/user.schema';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { FileUpload } from 'graphql-upload';
import { ApolloError } from 'apollo-server-express';

dotenv.config({
  path: path.resolve('.development.env'),
});

@Injectable()
export class GroupMutation {
  constructor(
    @Inject('GROUP_MODEL')
    private groupModel: Model<Group>,

    @Inject('USER_MODEL')
    private userModel: Model<User>,
  ) {}

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
      image,
    } = group;
    const groupSchema = {
      gname,
      leader,
      createdAt,
      description,
      memberList: [leader],
      mainCategory,
      secret,
      password: password
        ? await bcrypt.hash(password, Number(process.env.SALT))
        : password,
      schedules: [],
      image,
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
      console.log(err);
      throw new ApolloError('DB Error', 'DB_ERROR');
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
      console.log(err);
      throw new ApolloError('DB Error', 'DB_ERROR');
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

      const result = await this.groupModel.findOne({ _id });
      result.success = true;

      return result;
    } catch (err) {
      console.log(err);
      throw new ApolloError('DB Error', 'DB_ERROR');
    }
  }

  async deleteGroup(group: DeleteGroupInput): Promise<Message> {
    const { email, _id } = group;

    try {
      const { nickname } = await this.userModel.findOne({ email });
      const { gname, leader, memberList } = await this.groupModel.findById({
        _id,
      });
      if (nickname !== leader) {
        return { message: 'not the owner of the group.', success: false };
      }

      for (const nickname of memberList) {
        const { myGroupList } = await this.userModel.findOne({ nickname });
        myGroupList.splice(myGroupList.indexOf(gname), 1);
        await this.userModel.updateOne({ nickname }, { myGroupList });
      }

      await this.groupModel.findByIdAndDelete({ _id });

      return { message: 'Successed delete group', success: true };
    } catch (err) {
      console.log(err);
      return { message: 'Failed delete group', success: false };
    }
  }

  async changeLeader(group: ChangeLeaderInput): Promise<Group> {
    const { _id, leader, nextLeader } = group;

    try {
      const groupInfo = await this.groupModel.findOne({ _id });
      if (groupInfo.leader === leader) {
        await this.groupModel.findOneAndUpdate({ _id }, { leader: nextLeader });
        const result = await this.groupModel.findOne({ _id });
        result.success = true;

        return result;
      } else {
        const result = await this.groupModel.findOne({ _id });
        result.success = false;

        return result;
      }
    } catch (err) {
      console.log(err);
      throw new ApolloError('DB Error', 'DB_ERROR');
    }
  }

  async changeGroupImage(group: FileUpload): Promise<Message> {
    const { createReadStream, filename, mimetype, encoding } = group;

    console.log(createReadStream);
    console.log(filename);
    console.log(mimetype);
    console.log(encoding);

    //const stream = createReadStream();

    return { message: '???' };
  }
}
