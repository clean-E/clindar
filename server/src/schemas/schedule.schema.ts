import { ObjectType, Field } from '@nestjs/graphql';
import mongoose from 'mongoose';

export const ScheduleSchema = new mongoose.Schema({
  category: { type: String },
  where: {
    place: { type: String },
  },
  when: {
    year: { type: String },
    month: { type: String },
    date: { type: String },
    startTime: { type: String },
  },
  who: {
    host: { type: String },
    guest: [
      {
        nickname: { type: String },
        record: [
          {
            level: { type: String },
            count: { type: Number },
          },
        ],
      },
    ],
  },
  memo: { type: String },
  group: [{ gname: { type: String } }],
});

@ObjectType()
export class Schedule {
  @Field()
  category: string;
  @Field()
  where: {
    place: string;
  };
  @Field()
  when: {
    year: string;
    month: string;
    date: string;
    startTime: string;
  };
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
  group: [{ gname: string }];
}

@ObjectType()
export class CreateScheduleInput {
  @Field()
  email: string;
  @Field()
  category: string;
  @Field()
  where: {
    place: string;
  };
  @Field()
  when: {
    year: string;
    month: string;
    date: string;
    startTime: string;
  };
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
  group: [{ gname: string }];
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
  category: string;
  @Field()
  where: {
    place: string;
  };
  @Field()
  when: {
    year: string;
    month: string;
    date: string;
    startTime: string;
  };
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
  group: [{ gname: string }];
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
