import { Mutation, Query } from '@nestjs/graphql';
import { Resolver } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User, UserInfo } from '../../schemas/user.schema';

@Resolver('User')
export class UserResolver {
  constructor(private userService: UserService) {}

  @Query(() => UserInfo)
  async getMyPage() {
    return await this.userService.getMyPage();
  }

  @Mutation(() => User)
  async login() {
    return await this.userService.login();
  }
}
