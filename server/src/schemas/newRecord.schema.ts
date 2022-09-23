import { Field, ObjectType } from '@nestjs/graphql';
import mongoose, { Schema } from 'mongoose';
import { Document } from 'mongoose';

export const RecordSchema = new mongoose.Schema({
  sId: { type: Schema.Types.ObjectId, ref: 'Schedule' },
  uId: { type: Schema.Types.ObjectId, ref: 'User' },
  record: [
    {
      level: { type: String },
      count: { type: Number },
    },
  ],
});
