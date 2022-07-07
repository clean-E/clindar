import { Args, Mutation, Query } from '@nestjs/graphql';
import { Resolver } from '@nestjs/graphql';
import { UserService } from './user.service';
import {
  LoginInput,
  User,
  UserInfo,
  UserEmail,
} from '../../schemas/user.schema';

@Resolver('User')
export class UserResolver {
  constructor(private userService: UserService) {}

  @Query(() => UserInfo)
  async getMyPage(@Args('user') user: UserEmail) {
    return await this.userService.getMyPage(user);
  }

  @Mutation(() => User)
  async login(@Args('user') user: LoginInput) {
    return await this.userService.login(user);
  }
}
