import { Connection } from 'mongoose';
import { RecordSchema } from 'src/schemas/record.schema';
import { ScheduleSchema } from 'src/schemas/schedule.schema';
import { UserSchema } from 'src/schemas/user.schema';

export const UserProviders = [
  {
    provide: 'USER_MODEL',
    useFactory: (connection: Connection) =>
      connection.model('User', UserSchema, 'User'),
    inject: ['DATABASE_CONNECTION'],
  },
  {
    provide: 'RECORD_MODEL',
    useFactory: (connection: Connection) =>
      connection.model('Record', RecordSchema, 'Record'),
    inject: ['DATABASE_CONNECTION'],
  },
  {
    provide: 'SCHEDULE_MODEL',
    useFactory: (connection: Connection) =>
      connection.model('Schedule', ScheduleSchema, 'Schedule'),
    inject: ['DATABASE_CONNECTION'],
  },
];
