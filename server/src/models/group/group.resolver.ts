import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { FileUpload } from 'graphql-upload';

import {
  CreateGroupInput,
  DeleteGroupInput,
  Group,
  GroupId,
  GroupPassword,
  JoinGroupInput,
  LeaveGroupInput,
  ChangeLeaderInput,
} from 'src/schemas/group.schema';
import { UserEmail } from 'src/schemas/user.schema';
import { GroupQuery } from './group_query.service';
import { GroupMutation } from './group_mutation.service';

@Resolver('Group')
export class GroupResolver {
  constructor(
    private groupQuery: GroupQuery,
    private groupMutation: GroupMutation,
  ) {}

  @Query(() => [Group])
  async getAllGroup() {
    return await this.groupQuery.getAllGroup();
  }

  @Query(() => [Group])
  async getMyGroup(@Args('group') group: UserEmail) {
    return await this.groupQuery.getMyGroup(group);
  }

  @Query(() => Group)
  async getGroupDetail(@Args('group') group: GroupId) {
    return await this.groupQuery.getGroupDetail(group);
  }

  @Query(() => Group || String)
  async openSecretGroup(@Args('group') group: GroupPassword) {
    return await this.groupQuery.openSecretGroup(group);
  }

  @Mutation(() => Group)
  async createGroup(@Args('group') group: CreateGroupInput) {
    return await this.groupMutation.createGroup(group);
  }

  @Mutation(() => Group)
  async joinGroup(@Args('group') group: JoinGroupInput) {
    return await this.groupMutation.joinGroup(group);
  }

  @Mutation(() => Group)
  async leaveGroup(@Args('group') group: LeaveGroupInput) {
    return await this.groupMutation.leaveGroup(group);
  }

  @Mutation(() => String)
  async deleteGroup(@Args('group') group: DeleteGroupInput) {
    return await this.groupMutation.deleteGroup(group);
  }

  @Mutation(() => Group)
  async changeLeader(@Args('group') group: ChangeLeaderInput) {
    return await this.groupMutation.changeLeader(group);
  }

  @Mutation(() => Group)
  async changeGroupImage(@Args('group') group: FileUpload) {
    return await this.groupMutation.changeGroupImage(group);
  }
}
