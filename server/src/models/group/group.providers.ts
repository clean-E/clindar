import { Connection } from 'mongoose';
import { GroupSchema } from 'src/schemas/group.schema';
import { UserSchema } from 'src/schemas/user.schema';

export const GroupProviders = [
  {
    provide: 'GROUP_MODEL',
    useFactory: (connection: Connection) =>
      connection.model('clindar', GroupSchema, 'Group'),
    inject: ['DATABASE_CONNECTION'],
  },
  {
    provide: 'USER_MODEL',
    useFactory: (connection: Connection) =>
      connection.model('User', UserSchema, 'User'),
    inject: ['DATABASE_CONNECTION'],
  },
];
