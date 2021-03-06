import { Connection } from 'mongoose';
import { UserSchema } from 'src/schemas/user.schema';

export const UserProviders = [
  {
    provide: 'USER_MODEL',
    useFactory: (connection: Connection) =>
      connection.model('User', UserSchema, 'User'),
    inject: ['DATABASE_CONNECTION'],
  },
];
