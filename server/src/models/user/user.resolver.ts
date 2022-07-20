import { Args, Mutation, Query } from '@nestjs/graphql';
import { Resolver } from '@nestjs/graphql';
import { UserService } from './user.service';
import {
  LoginInput,
  User,
  UserEmail,
  NicknameInput,
} from '../../schemas/user.schema';

@Resolver('User')
export class UserResolver {
  constructor(private userService: UserService) {}

  @Query(() => User)
  async getMyPage(@Args('user') user: UserEmail) {
    return await this.userService.getMyPage(user);
  }

  @Mutation(() => User)
  async login(@Args('user') user: LoginInput) {
    return await this.userService.login(user);
  }

  @Mutation(() => User)
  async setNickname(@Args('user') user: NicknameInput) {
    return await this.userService.setNickname(user);
  }
}
