import { Schema, model } from 'mongoose';
import { string } from 'zod/v4';

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    role: { type: String, enum: ['customer', 'organizer', 'admin'], default: 'customer' },
    isActive: { type: Boolean, default: true },

    //the below fields is for forgot password 
    //next go to the controller (auth.controller.ts)
    passwordresetToken:{type:String ,select:false},
    passwordResetExpires: {type:Date,select:false}
  },
  { timestamps: true }
);

export const User = model('User', userSchema);
