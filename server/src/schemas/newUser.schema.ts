import { Field, ObjectType } from '@nestjs/graphql';
import mongoose, { Schema } from 'mongoose';
import { Document } from 'mongoose';

export const UserSchema = new mongoose.Schema({
  email: { type: String, require: true },
  nickname: { type: String },
  myGroupList: [{ type: Schema.Types.ObjectId, ref: 'Group' }],
  myScheduleList: [{ type: Schema.Types.ObjectId, ref: 'Schedule' }],
  records: [{ type: Schema.Types.ObjectId, ref: 'Record' }],
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

  @Field()
  success: boolean;
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
