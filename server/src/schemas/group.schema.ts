import { Field, ObjectType } from '@nestjs/graphql';
import mongoose from 'mongoose';
import { Document } from 'mongoose';

export const GroupSchema = new mongoose.Schema({
  gname: { type: String },
  leader: { type: String },
  createdAt: { type: String },
  description: { type: String },
  memberList: [String],
  mainCategory: { type: String },
  secret: { type: Boolean },
  password: { type: String },
  schedules: [String],
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
  value: string;
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

@ObjectType()
export class ImageUrlInput {
  @Field()
  image: string;
}
