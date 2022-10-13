import { Field, ObjectType } from '@nestjs/graphql';
import mongoose from 'mongoose';
import { Document } from 'mongoose';

export const SpotSchema = new mongoose.Schema({
  address: { type: String },
});
