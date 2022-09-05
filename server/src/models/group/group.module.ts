import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database.module';
import { GroupProviders } from './group.providers';
import { GroupResolver } from './group.resolver';
import { GroupMutation } from './group_mutation.service';
import { GroupQuery } from './group_query.service';

@Module({
  imports: [DatabaseModule],
  providers: [GroupResolver, GroupQuery, GroupMutation, ...GroupProviders],
})
export class GroupModule {}
