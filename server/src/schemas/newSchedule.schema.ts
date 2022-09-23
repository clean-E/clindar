import { ObjectType, Field } from '@nestjs/graphql';
import mongoose, { Schema } from 'mongoose';
import { Document } from 'mongoose';

export const ScheduleSchema = new mongoose.Schema({
  category: [String],
  where: { type: String },
  when: { type: String },
  who: {
    host: { type: Schema.Types.ObjectId, ref: 'User' },
    guest: [
      {
        nickname: { type: String },
        record: { type: Schema.Types.ObjectId, ref: 'Record' },
      },
    ],
  },
  memo: { type: String },
  group: { type: Schema.Types.ObjectId, ref: 'Group' },
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
        record: [
          {
            level: string;
            count: number;
          }?,
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
