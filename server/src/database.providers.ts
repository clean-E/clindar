import * as mongoose from 'mongoose';

import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({
  path: path.resolve('.development.env'),
});

const uri = `mongodb+srv://clindar:${process.env.DB_SECRET}@clindar.favx6.mongodb.net/?retryWrites=true&w=majority`;
export const databaseProviders = [
  {
    provide: 'DATABASE_CONNECTION',
    useFactory: (): Promise<typeof mongoose> => mongoose.connect(uri),
  },
];
