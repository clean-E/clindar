import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { UserModule } from './models/user/user.module';
import { ScheduleModule } from './models/schedule/schedule.module';
import { GroupModule } from './models/group/group.module';
import { SpotModule } from './models/spot/spot.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      typePaths: ['./**/*.gql'],
      cors: {
        origin: '*',
        credentials: true,
      },
    }),

    UserModule,
    ScheduleModule,
    GroupModule,
    SpotModule,
  ],
})
export class AppModule {}
