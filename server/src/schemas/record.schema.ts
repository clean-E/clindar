import { Field, ObjectType } from '@nestjs/graphql';
import mongoose, { Schema } from 'mongoose';
import { Document } from 'mongoose';

export const RecordSchema = new mongoose.Schema({
  sId: { type: String },
  uId: { type: String },
  record: [
    {
      level: { type: String },
      count: { type: Number },
    },
  ],
});
