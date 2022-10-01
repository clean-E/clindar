import { Field, ObjectType } from '@nestjs/graphql';
import mongoose from 'mongoose';
import { Document } from 'mongoose';

export const UserSchema = new mongoose.Schema({
  email: { type: String, require: true },
  nickname: { type: String },
  myGroupList: [{ type: String }],
  myScheduleList: [{ type: String }],
  records: [{ type: String }],
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
  records: string[];

  @Field()
  success: boolean;
}

@ObjectType()
export class ReturnUser {
  @Field()
  email: string;

  @Field()
  nickname: string;

  @Field()
  myGroupList: string[];

  @Field()
  records: MyRecord[];

  @Field()
  success: boolean;
}

@ObjectType()
export class MyRecord {
  @Field()
  where: string;

  @Field()
  when: string;

  @Field()
  records: [
    {
      level: string;
      count: number;
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
