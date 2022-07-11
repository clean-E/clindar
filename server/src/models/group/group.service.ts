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

  async getAllGroup(): Promise<Group[]> {}

  async getGroupDetail(group: GroupId): Promise<Group> {}

  async openSecretGroup(group: GroupPassword): Promise<Group> {}

  async createGroup(group: CreateGroupInput): Promise<Group> {}

  async joinGroup(group: JoinGroupInput): Promise<Group> {}

  async leaveGroup(group: LeaveGroupInput): Promise<Group> {}

  async deleteGroup(group: DeleteGroupInput): Promise<String> {}
}
