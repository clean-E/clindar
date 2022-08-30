import { Field, ObjectType } from '@nestjs/graphql';
import mongoose from 'mongoose';
import { Document } from 'mongoose';

export const UserSchema = new mongoose.Schema({
  email: { type: String, require: true },
  nickname: { type: String },
  myGroupList: [String],
  myScheduleList: [String],
  records: [
    {
      sId: { type: String },
      when: { type: String },
      where: { type: String },
      record: [
        {
          level: { type: String },
          count: { type: Number },
        },
      ],
    },
  ],
});

@ObjectType()
export class User extends Document {
  @Field()
  email: string;

  @Field()
  nickname: string;

  @Field()
  myGroupList: string[];

  @Field()
  myScheduleList: string[];

  @Field()
  records: [
    {
      sId: string;
      when: string;
      where: string;
      record: [
        {
          level: string;
          count: number;
        }?,
      ];
    }?,
  ];
}

@ObjectType()
export class LoginInput {
  @Field()
  email: string;

  @Field()
  nickname: string;
}

@ObjectType()
export class UserEmail {
  @Field()
  email: string;
}

@ObjectType()
export class NicknameInput {
  @Field()
  email: string;

  @Field()
  nickname: string;
}
