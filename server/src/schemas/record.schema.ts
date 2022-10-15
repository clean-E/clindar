import { Field, ObjectType } from '@nestjs/graphql';
import mongoose from 'mongoose';
import { Document } from 'mongoose';

export const RecordSchema = new mongoose.Schema({
  sId: { type: String },
  uId: { type: String },
  records: [
    {
      level: { type: String },
      nameOrColor: { type: String },
      count: { type: Number },
    },
  ],
});

@ObjectType()
export class Records extends Document {
  @Field()
  sId: string;

  @Field()
  uId: string;

  @Field()
  records: Record[];
}

@ObjectType()
export class Record {
  @Field()
  level: string;

  @Field()
  nameOrColor: string;

  @Field()
  count: number;
}
