import { ObjectType, Field } from '@nestjs/graphql';
import mongoose, { ObjectId } from 'mongoose';
import { Document } from 'mongoose';

export const ScheduleSchema = new mongoose.Schema({
  category: [String],
  where: { type: String },
  when: { type: String },
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
        record: { type: string };
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
  _id: ObjectId;
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
  record: [{ level: string; count: number }?];
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
    guest: [
      {
        nickname: string;
        record: [];
      },
    ];
  };
  @Field()
  memo: string;
  @Field()
  group: string;
}

@ObjectType()
export class DeleteScheduleInput {
  @Field()
  _id: string;
  @Field()
  email: string;
}

@ObjectType()
export class EditScheduleInput {
  @Field()
  email: string;
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
    guest: [
      {
        nickname: string;
        record: [
          {
            level: string;
            count: number;
          },
        ];
      },
    ];
  };
  @Field()
  memo: string;
  @Field()
  group: string;
}

@ObjectType()
export class InviteScheduleInput {
  @Field()
  _id: string;
  @Field()
  email: string;
  @Field()
  nickname: string;
}

@ObjectType()
export class JoinScheduleInput {
  @Field()
  _id: string;
  @Field()
  email: string;
  @Field()
  nickname: string;
}

@ObjectType()
export class ComeoutScheduleInput {
  @Field()
  _id: string;
  @Field()
  email: string;
}

@ObjectType()
export class EditRecordInput {
  @Field()
  _id: string;
  @Field()
  nickname: string;
  @Field()
  record: [
    {
      level: string;
      count: number;
    },
  ];
}

@ObjectType()
export class ScheduleId {
  @Field()
  _id: string;
}
