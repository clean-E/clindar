import { ObjectType, Field } from '@nestjs/graphql';
import mongoose, { ObjectId } from 'mongoose';
import { Document } from 'mongoose';
import { Record } from './record.schema';

export const ScheduleSchema = new mongoose.Schema({
  category: [String],
  when: { type: String },
  spot: { type: String },

  host: { type: String },
  guest: [
    {
      nickname: { type: String },
      record: { type: String },
    },
  ],

  memo: { type: String },
  group: { type: String },
});

@ObjectType()
export class Schedule extends Document {
  @Field()
  category: string[];
  @Field()
  spot: string;
  @Field()
  when: string;
  @Field()
  host: string;
  @Field()
  guest: {
    nickname: string;
    record: string;
  }[];
  @Field()
  memo: string;
  @Field()
  group: string;
}

@ObjectType()
export class ReturnSchedule {
  @Field()
  _id: string;
  @Field()
  category: string[];
  @Field()
  spot: string;
  @Field()
  when: string;
  @Field()
  host: string;
  @Field()
  guest: Guest[];
  @Field()
  memo: string;
  @Field()
  group: string;
}

@ObjectType()
export class Guest {
  @Field()
  nickname: string;
  @Field()
  record: Record[];
}

@ObjectType()
export class CreateScheduleInput {
  @Field()
  email: string;
  @Field()
  category: string[];
  @Field()
  spot: string;
  @Field()
  when: string;
  @Field()
  host: string;
  @Field()
  guest: {
    nickname: string;
    record: string;
  }[];
  @Field()
  memo: string;
  @Field()
  group: string;
}

@ObjectType()
export class EditScheduleInput {
  @Field()
  _id: string;
  @Field()
  email: string;
  @Field()
  category: string[];
  @Field()
  spot: string;
  @Field()
  when: string;
  @Field()
  memo: string;
  @Field()
  group: string;
}
