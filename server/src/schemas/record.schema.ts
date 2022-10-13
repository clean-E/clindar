import { Field, ObjectType } from '@nestjs/graphql';
import mongoose from 'mongoose';
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

@ObjectType()
export class Record extends Document {
  @Field()
  sId: string;

  @Field()
  uId: string;

  @Field()
  records: [
    {
      level: string;
      count: number;
    }?,
  ];
}
