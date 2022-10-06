import { Args, Mutation, Query } from '@nestjs/graphql';
import { Resolver } from '@nestjs/graphql';
import { UserQuery } from './user_query.service';
import { UserMutation } from './user_mutation.service';
import {
  LoginInput,
  User,
  UserEmail,
  NicknameInput,
} from '../../schemas/user.schema';

@Resolver('User')
export class UserResolver {
  constructor(
    private userQuery: UserQuery,
    private userMutation: UserMutation,
  ) {}

  @Query(() => User)
  async getMyPage(@Args('user') user: UserEmail) {
    return await this.userQuery.getMyPage(user);
  }

  @Mutation(() => User)
  async login(@Args('user') user: LoginInput) {
    return await this.userMutation.login(user);
  }

  @Mutation(() => User)
  async setNickname(@Args('user') user: NicknameInput) {
    return await this.userMutation.setNickname(user);
  }

  @Mutation(() => User)
  async deleteUser(@Args('user') user: UserEmail) {
    return await this.userMutation.deleteUser(user);
  }
}
