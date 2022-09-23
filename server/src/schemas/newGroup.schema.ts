import { Field, ObjectType } from '@nestjs/graphql';
import mongoose, { Schema } from 'mongoose';
import { Document } from 'mongoose';

export const GroupSchema = new mongoose.Schema({
  gname: { type: String },
  leader: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: String },
  description: { type: String },
  memberList: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  mainCategory: { type: String },
  secret: { type: Boolean },
  password: { type: String },
  schedules: [{ type: Schema.Types.ObjectId, ref: 'Schedule' }],
  image: { type: String },
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
  secret: boolean;
  @Field()
  password: string;
  @Field()
  schedules: string[];
  @Field()
  image: string;
  @Field()
  success: boolean;
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
  secret: boolean;
  @Field()
  password: string;
  @Field()
  image: string;
}

@ObjectType()
export class JoinGroupInput {
  @Field()
  email: string;
  @Field()
  _id: string;
}

@ObjectType()
export class LeaveGroupInput {
  @Field()
  email: string;
  @Field()
  _id: string;
}

@ObjectType()
export class DeleteGroupInput {
  @Field()
  email: string;
  @Field()
  _id: string;
}

@ObjectType()
export class GroupId {
  @Field()
  _id: string;
}

@ObjectType()
export class GroupPassword {
  @Field()
  _id: string;
  @Field()
  password: string;
}

@ObjectType()
export class Message {
  @Field()
  message: string;
  @Field()
  success?: boolean;
}

@ObjectType()
export class ChangeLeaderInput {
  @Field()
  _id: string;

  @Field()
  leader: string;

  @Field()
  nextLeader: string;
}
