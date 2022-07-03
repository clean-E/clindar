import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database.module';
import { UserProviders } from './user.providers';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';

@Module({
  imports: [DatabaseModule],
  providers: [UserResolver, UserService, ...UserProviders],
})
export class UserModule {}
