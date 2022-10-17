import { Field, ObjectType } from '@nestjs/graphql';
import mongoose from 'mongoose';
import { Document } from 'mongoose';

export const SpotSchema = new mongoose.Schema({
  spotName: { type: String },
  spotBranch: { type: String },
  address: { type: String },
  phase: [
    {
      level: { type: String },
      nameOrColor: { type: String },
    },
  ],
  category: [String],
  // map: Image
});

@ObjectType()
export class Spot extends Document {
  @Field()
  spotName: string;
  @Field()
  spotBranch: string;
  @Field()
  address: string;
  @Field()
  phase: Phase[];
  @Field()
  category: string[];
}

@ObjectType()
export class Phase {
  @Field()
  level: string;
  @Field()
  nameOrColor: string;
}
