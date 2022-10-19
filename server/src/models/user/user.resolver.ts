import { Args, Mutation, Query } from '@nestjs/graphql';
import { Resolver } from '@nestjs/graphql';
import { UserQuery } from './user_query.service';
import { UserMutation } from './user_mutation.service';
import { User, ReturnUser, UserInput, Result } from '../../schemas/user.schema';

@Resolver('User')
export class UserResolver {
  constructor(
    private userQuery: UserQuery,
    private userMutation: UserMutation,
  ) {}

  // @Query(() => ReturnUser)
  // async getMyPage(@Args('email') email: string) {
  //   return await this.userQuery.getMyPage(email);
  // }

  @Query(() => [User])
  async getAllUser() {
    return await this.userQuery.getAllUser();
  }

  @Mutation(() => User)
  async login(@Args('userInfo') userInfo: UserInput) {
    return await this.userMutation.login(userInfo);
  }

  @Mutation(() => User)
  async setNickname(@Args('userInfo') userInfo: UserInput) {
    return await this.userMutation.setNickname(userInfo);
  }

  // @Mutation(() => Result)
  // async deleteUser(@Args('email') email: string) {
  //   return await this.userMutation.deleteUser(email);
  // }
}
