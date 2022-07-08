import { Connection } from 'mongoose';
import { GroupSchema } from 'src/schemas/group.schema';
import { ScheduleSchema } from 'src/schemas/schedule.schema';
import { UserSchema } from 'src/schemas/user.schema';

export const ScheduleProviders = [
  {
    provide: 'USER_MODEL',
    useFactory: (connection: Connection) =>
      connection.model('User', UserSchema, 'User'),
    inject: ['DATABASE_CONNECTION'],
  },
  {
    provide: 'SCHEDULE_MODEL',
    useFactory: (connection: Connection) =>
      connection.model('Schedule', ScheduleSchema, 'Schedule'),
    inject: ['DATABASE_CONNECTION'],
  },
  {
    provide: 'GROUP_MODEL',
    useFactory: (connection: Connection) =>
      connection.model('Group', GroupSchema, 'Group'),
    inject: ['DATABASE_CONNECTION'],
  },
];
