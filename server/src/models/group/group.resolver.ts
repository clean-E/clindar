import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { FileUpload } from 'graphql-upload';

import { CreateGroupInput, Group, ReturnGroup } from 'src/schemas/group.schema';
import { GroupQuery } from './group_query.service';
import { GroupMutation } from './group_mutation.service';
import { Result } from 'src/schemas/user.schema';

@Resolver('Group')
export class GroupResolver {
  constructor(
    private groupQuery: GroupQuery,
    private groupMutation: GroupMutation,
  ) {}

  @Query(() => Result)
  async checkDuplicateGroupName(@Args('gname') gname: string) {
    return await this.groupQuery.checkDuplicateGroupName(gname);
  }

  @Query(() => [Group])
  async getAllGroup() {
    return await this.groupQuery.getAllGroup();
  }

  @Query(() => [Group])
  async getMyGroup(@Args('email') email: string) {
    return await this.groupQuery.getMyGroup(email);
  }

  @Query(() => ReturnGroup)
  async getGroupDetail(@Args('email') email: string, @Args('_id') _id: string) {
    return await this.groupQuery.getGroupDetail(email, _id);
  }

  @Query(() => ReturnGroup)
  async openSecretGroup(
    @Args('_id') _id: string,
    @Args('password') password: string,
  ) {
    return await this.groupQuery.openSecretGroup(_id, password);
  }

  @Mutation(() => ReturnGroup)
  async createGroup(@Args('group') group: CreateGroupInput) {
    return await this.groupMutation.createGroup(group);
  }

  @Mutation(() => ReturnGroup)
  async joinGroup(@Args('_id') _id: string, @Args('email') email: string) {
    return await this.groupMutation.joinGroup(_id, email);
  }

  // @Mutation(() => Group)
  // async leaveGroup(@Args('group') group: LeaveGroupInput) {
  //   return await this.groupMutation.leaveGroup(group);
  // }

  // @Mutation(() => String)
  // async deleteGroup(@Args('group') group: DeleteGroupInput) {
  //   return await this.groupMutation.deleteGroup(group);
  // }

  @Mutation(() => ReturnGroup)
  async changeLeader(
    @Args('_id') _id: string,
    @Args('email') email: string,
    @Args('newLeader') newLeader: string,
  ) {
    return await this.groupMutation.changeLeader(_id, email, newLeader);
  }

  // @Mutation(() => Group)
  // async changeGroupImage(@Args('group') group: FileUpload) {
  //   return await this.groupMutation.changeGroupImage(group);
  // }
}
