import { Field, ObjectType } from '@nestjs/graphql';
import mongoose from 'mongoose';
import { Document } from 'mongoose';

export const UserSchema = new mongoose.Schema({
  email: { type: String, require: true },
  nickname: { type: String },
  myGroupList: [
    {
      gname: { type: String },
    },
  ],
  myScheduleList: [{ cId: { type: String } }],
});

@ObjectType()
export class User extends Document {
  @Field()
  email: string;

  @Field()
  nickname: string;

  @Field()
  myGroupList: [string];

  @Field()
  myScheduleList: [string];
}

@ObjectType()
export class UserInfo {
  @Field()
  nickname: string;

  @Field()
  email: string;

  @Field()
  myGroupList: [
    {
      gname: string;
    },
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
