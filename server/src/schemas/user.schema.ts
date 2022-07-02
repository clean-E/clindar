import mongoose from 'mongoose';

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
