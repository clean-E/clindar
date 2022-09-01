import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { UserModule } from './models/user/user.module';
import { ScheduleModule } from './models/schedule/schedule.module';
import { GroupModule } from './models/group/group.module';
import { graphqlUploadExpress } from 'graphql-upload';
import { GraphQLWithUploadModule } from './graphql-with-upload.module';

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
    // GraphQLModule.forRoot({
    //   uploads: false, // disable built-in upload handling
    // }),
    // GraphQLWithUploadModule.forRoot(),
  ],
})
export class AppModule {}
// export class AppModule implements NestModule {
//   configure(consumer: MiddlewareConsumer) {
//     consumer.apply(graphqlUploadExpress()).forRoutes('graphql');
//   }
// }
