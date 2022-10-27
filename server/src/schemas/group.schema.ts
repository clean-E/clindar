import { Field, ObjectType } from '@nestjs/graphql';
import mongoose, { Schema } from 'mongoose';
import { Document } from 'mongoose';
import { ReturnSchedule } from './schedule.schema';

export const GroupSchema = new mongoose.Schema({
  gname: { type: String },
  leader: { type: String },
  createdAt: { type: String },
  description: { type: String },
  memberList: [{ type: String }],
  mainCategory: { type: String },
  age: [Number],
  secret: { type: Boolean },
  password: { type: String },
  schedules: [{ type: String }],
  // image: { type: String },
});

@ObjectType()
export class Group extends Document {
  @Field()
  gname: string;
  @Field()
  leader: string;
  @Field()
  createdAt: string;
  @Field()
  description: string;
  @Field()
  memberList: string[];
  @Field()
  mainCategory: string;
  @Field()
  age: number[];
  @Field()
  secret: boolean;
  @Field()
  password: string;
  @Field()
  schedules: string[];
  // @Field()
  // image: string;
}

@ObjectType()
export class CreateGroupInput {
  @Field()
  email: string;
  @Field()
  gname: string;
  @Field()
  leader: string;
  @Field()
  createdAt: string;
  @Field()
  description: string;
  @Field()
  mainCategory: string;
  @Field()
  age: number[];
  @Field()
  secret: boolean;
  @Field()
  password: string;
  // @Field()
  // image: string;
}

@ObjectType()
export class EditGroupInput {
  @Field()
  _id: string;
  @Field()
  email: string;
  @Field()
  gname: string;
  @Field()
  leader: string;
  @Field()
  createdAt: string;
  @Field()
  description: string;
  @Field()
  mainCategory: string;
  @Field()
  age: number[];
  @Field()
  secret: boolean;
  @Field()
  password: string;
  @Field()
  schedules: string[];
  // @Field()
  // image: string;
}

@ObjectType()
export class ReturnGroup {
  @Field()
  _id: string;
  @Field()
  gname: string;
  @Field()
  leader: string;
  @Field()
  createdAt: string;
  @Field()
  description: string;
  @Field()
  memberList: string[];
  @Field()
  mainCategory: string;
  @Field()
  secret: boolean;
  @Field()
  schedules: ReturnSchedule[];
  @Field()
  join: boolean;
  // @Field()
  // image: string;
}
