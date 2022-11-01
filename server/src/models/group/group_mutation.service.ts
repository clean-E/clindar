import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { CreateGroupInput, Group, ReturnGroup } from 'src/schemas/group.schema';
import { User } from 'src/schemas/user.schema';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { FileUpload } from 'graphql-upload';
import { ApolloError } from 'apollo-server-express';
import { ReturnSchedule, Schedule } from 'src/schemas/schedule.schema';

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

    @Inject('SCHEDULE_MODEL')
    private scheduleModel: Model<Schedule>,
  ) {}

  async createGroup(group: CreateGroupInput): Promise<ReturnGroup> {
    // email, gname, leader, createdAt, description, mainCategory, age, secret, password
    const { email } = group;
    delete group.email;
    const groupExist = await this.groupModel.exists({ gname: group.gname });
    if (groupExist !== null) {
      throw new Error('Group name Already Exists');
    }
    group.password = group.password
      ? await bcrypt.hash(group.password, Number(process.env.SALT))
      : group.password;
    // memberList, schedules
    const userInfo = await this.userModel.findOne({ email: group.email });
    group['memberList'] = [userInfo.id];
    group['schedules'] = [];

    const newGroup = await this.groupModel.create(group);
    await this.userModel.updateOne(
      { email },
      { myGroupList: [...userInfo.myGroupList, newGroup.id] },
    );

    // leader, memberList, schedules, join
    const leader = (await this.userModel.findById(newGroup.leader)).nickname;
    const memberList = await Promise.all(
      newGroup.memberList.map(async (mem) => {
        return (await this.userModel.findById(mem)).nickname;
      }),
    );
    const schedules: ReturnSchedule[] = await Promise.all(
      newGroup.schedules.map(async (schedule) => {
        return await this.scheduleModel.findById(schedule);
      }),
    );
    const join = memberList.includes(userInfo.nickname);

    return { ...newGroup, leader, memberList, schedules, join };
  }

  async joinGroup(_id: string, email: string): Promise<ReturnGroup> {
    const userInfo = await this.userModel.findOne({ email });
    const groupInfo = await this.groupModel.findOne({ _id });
    await this.userModel.updateOne(
      { email },
      { myGroupList: [...userInfo.myGroupList, _id] },
    );
    await this.groupModel.updateOne(
      { _id },
      { memberList: [...groupInfo.memberList, userInfo.id] },
    );

    // leader, memberList, schedules, join
    const leader = (await this.userModel.findById(groupInfo.leader)).nickname;
    const memberList = await Promise.all(
      groupInfo.memberList.map(async (mem) => {
        return (await this.userModel.findById(mem)).nickname;
      }),
    );
    const schedules: ReturnSchedule[] = await Promise.all(
      groupInfo.schedules.map(async (schedule) => {
        return await this.scheduleModel.findById(schedule);
      }),
    );
    const join = memberList.includes(userInfo.nickname);

    return { ...groupInfo, leader, memberList, schedules, join };
  }

  // async leaveGroup(group: LeaveGroupInput): Promise<Group> {
  //   const { email, _id } = group;

  //   try {
  //     const userInfo = await this.userModel.findOne({ email });
  //     const groupInfo = await this.groupModel.findOne({ _id });

  //     await this.userModel.updateOne(
  //       { email },
  //       {
  //         myGroupList: userInfo.myGroupList.splice(
  //           userInfo.myGroupList.indexOf(groupInfo.gname),
  //           1,
  //         ),
  //       },
  //     );

  //     await this.groupModel.updateOne(
  //       { _id },
  //       {
  //         memberList: groupInfo.memberList.splice(
  //           groupInfo.memberList.indexOf(userInfo.nickname),
  //           1,
  //         ),
  //       },
  //     );

  //     const result = await this.groupModel.findOne({ _id });
  //     result.success = true;

  //     return result;
  //   } catch (err) {
  //     console.log(err);
  //     throw new ApolloError('DB Error', 'DB_ERROR');
  //   }
  // }

  // async deleteGroup(group: DeleteGroupInput): Promise<Message> {
  //   const { email, _id } = group;

  //   try {
  //     const { nickname } = await this.userModel.findOne({ email });
  //     const { gname, leader, memberList } = await this.groupModel.findById({
  //       _id,
  //     });
  //     if (nickname !== leader) {
  //       return { message: 'not the owner of the group.', success: false };
  //     }

  //     for (const nickname of memberList) {
  //       const { myGroupList } = await this.userModel.findOne({ nickname });
  //       myGroupList.splice(myGroupList.indexOf(gname), 1);
  //       await this.userModel.updateOne({ nickname }, { myGroupList });
  //     }

  //     await this.groupModel.findByIdAndDelete({ _id });

  //     return { message: 'Successed delete group', success: true };
  //   } catch (err) {
  //     console.log(err);
  //     return { message: 'Failed delete group', success: false };
  //   }
  // }

  async changeLeader(
    _id: string,
    email: string,
    newLeader: string,
  ): Promise<ReturnGroup> {
    const userInfo = await this.userModel.findOne({ email });
    const groupInfo = await this.groupModel.findById(_id);
    if (groupInfo.leader === userInfo.id) {
      await this.groupModel.findOneAndUpdate({ _id }, { leader: newLeader });

      // leader, memberList, schedules, join
      const leader = (await this.userModel.findById(newLeader)).nickname;
      const memberList = await Promise.all(
        groupInfo.memberList.map(async (mem) => {
          return (await this.userModel.findById(mem)).nickname;
        }),
      );
      const schedules: ReturnSchedule[] = await Promise.all(
        groupInfo.schedules.map(async (schedule) => {
          return await this.scheduleModel.findById(schedule);
        }),
      );
      const join = memberList.includes(userInfo.nickname);

      return { ...groupInfo, leader, memberList, schedules, join };
    } else {
      // leader, memberList, schedules, join
      const leader = (await this.userModel.findById(groupInfo.leader)).nickname;
      const memberList = await Promise.all(
        groupInfo.memberList.map(async (mem) => {
          return (await this.userModel.findById(mem)).nickname;
        }),
      );
      const schedules: ReturnSchedule[] = await Promise.all(
        groupInfo.schedules.map(async (schedule) => {
          return await this.scheduleModel.findById(schedule);
        }),
      );
      const join = memberList.includes(userInfo.nickname);

      return { ...groupInfo, leader, memberList, schedules, join };
    }
  }

  // async changeGroupImage(group: FileUpload): Promise<Message> {
  //   const { createReadStream, filename, mimetype, encoding } = group;

  //   console.log(createReadStream);
  //   console.log(filename);
  //   console.log(mimetype);
  //   console.log(encoding);

  //   //const stream = createReadStream();

  //   return { message: '???' };
  // }
}
