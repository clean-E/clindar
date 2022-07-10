import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database.module';
import { GroupProviders } from './group.providers';
import { GroupResolver } from './group.resolver';
import { GroupService } from './group.service';

@Module({
  imports: [DatabaseModule],
  providers: [GroupResolver, GroupService, ...GroupProviders],
})
export class GroupModule {}
