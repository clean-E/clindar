import { Field, ObjectType } from '@nestjs/graphql';
import mongoose from 'mongoose';
import { Document } from 'mongoose';
import { Record } from './record.schema';

export const UserSchema = new mongoose.Schema({
  email: { type: String },
  nickname: { type: String },
  myGroupList: [{ type: String }],
  myScheduleList: [{ type: String }],
  myRecord: [{ type: String }],
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
  myRecord: string[];
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
  myRecord: MyRecord[];
}

@ObjectType()
export class MyRecord {
  @Field()
  spotName: string;
  @Field()
  records: Record[];
}

@ObjectType()
export class UserInput {
  @Field()
  email: string;
  @Field()
  nickname: string;
}

@ObjectType()
export class Result {
  @Field()
  success: boolean;
}
