import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
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
import { GroupService } from './group.service';

@Resolver('Group')
export class GroupResolver {
  constructor(private groupService: GroupService) {}

  @Query(() => [Group])
  async getAllGroup() {
    return await this.groupService.getAllGroup();
  }

  @Query(() => [Group])
  async getMyGroup(@Args('group') group: UserEmail) {
    return await this.groupService.getMyGroup(group);
  }

  @Query(() => Group)
  async getGroupDetail(@Args('group') group: GroupId) {
    return await this.groupService.getGroupDetail(group);
  }

  @Query(() => Group || String)
  async openSecretGroup(@Args('group') group: GroupPassword) {
    return await this.groupService.openSecretGroup(group);
  }

  @Mutation(() => Group)
  async createGroup(@Args('group') group: CreateGroupInput) {
    return await this.groupService.createGroup(group);
  }

  @Mutation(() => Group)
  async joinGroup(@Args('group') group: JoinGroupInput) {
    return await this.groupService.joinGroup(group);
  }

  @Mutation(() => Group)
  async leaveGroup(@Args('group') group: LeaveGroupInput) {
    return await this.groupService.leaveGroup(group);
  }

  @Mutation(() => String)
  async deleteGroup(@Args('group') group: DeleteGroupInput) {
    return await this.groupService.deleteGroup(group);
  }

  @Mutation(() => Group)
  async changeLeader(@Args('group') group: ChangeLeaderInput) {
    return await this.groupService.changeLeader(group);
  }
}
