import { ObjectType, Field } from '@nestjs/graphql';
import mongoose, { ObjectId } from 'mongoose';
import { Document } from 'mongoose';
import { Record } from './record.schema';

export const ScheduleSchema = new mongoose.Schema({
  category: [String],
  when: { type: String },
  where: { type: String },
  who: {
    host: { type: String },
    guest: [
      {
        nickname: { type: String },
        record: { type: String },
      },
    ],
  },
  memo: { type: String },
  group: { type: String },
});

@ObjectType()
export class Schedule extends Document {
  @Field()
  category: string[];
  @Field()
  where: string;
  @Field()
  when: string;
  @Field()
  who: {
    host: string;
    guest: [
      {
        nickname: string;
        record: string;
      },
    ];
  };
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
  where: string;
  @Field()
  when: string;
  @Field()
  who: {
    host: string;
    guest: Guest[];
  };
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
  where: string;
  @Field()
  when: string;
  @Field()
  who: {
    host: string;
    guest: Guest[];
  };
  @Field()
  memo: string;
  @Field()
  group: string;
}

@ObjectType()
export class EditScheduleInput {
  @Field()
  id: string;
  @Field()
  email: string;
  @Field()
  category: string[];
  @Field()
  where: string;
  @Field()
  when: string;
  @Field()
  who: {
    host: string;
    guest: Guest[];
  };
  @Field()
  memo: string;
  @Field()
  group: string;
}
