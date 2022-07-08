import { Field, ObjectType } from '@nestjs/graphql';
import mongoose from 'mongoose';

export const GroupSchema = new mongoose.Schema({
  gname: { type: String },
  leader: { type: String },
  createdAt: { type: String },
  description: { type: String },
  memberList: [{ type: String }],
  mainCategory: { type: String },
  secret: { type: Boolean },
  password: { type: String },
  schedules: [{ type: String }],
});

@ObjectType()
export class Group {
  @Field()
  gname: string;
  @Field()
  leader: string;
  @Field()
  createdAt: string;
  @Field()
  description: string;
  @Field()
  memberList: [string];
  @Field()
  mainCategory: string;
  @Field()
  secret: boolean;
  @Field()
  schedules: [string];
}

@ObjectType()
export class CreateGroupInput {
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
  secret: boolean;
  @Field()
  password: string;
}

@ObjectType()
export class JoinGroupInput {
  @Field()
  _id: string;
}

@ObjectType()
export class LeaveGroupInput {
  @Field()
  _id: string;
}

@ObjectType()
export class DeleteGroupInput {
  @Field()
  _id: string;
}

@ObjectType()
export class GroupId {
  @Field()
  _id: string;
}
