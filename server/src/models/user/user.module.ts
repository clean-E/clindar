import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database.module';
import { UserProviders } from './user.providers';
import { UserResolver } from './user.resolver';
import { UserMutation } from './user_mutation.service';
import { UserQuery } from './user_query.service';

@Module({
  imports: [DatabaseModule],
  providers: [UserResolver, UserQuery, UserMutation, ...UserProviders],
})
export class UserModule {}
