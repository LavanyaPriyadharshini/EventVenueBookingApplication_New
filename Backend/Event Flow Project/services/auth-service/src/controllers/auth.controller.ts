import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { asyncHandler, AppError } from '@eventflow/shared';
//async handler is the wrapper that forwards errors from asynchronous express handlers to error-handling middleware
import { User } from '../models/user.model';

import crypto from 'node:crypto'; //this is used exclusively for forgot password
import { email } from 'zod/v4';




//here we are using zod validation
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  mobileNumber: z.string().min(1),
});

const signToken = (id: string, role: string) =>
  jwt.sign({ sub: id, role }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN as any,
  });


  //the two below things are used for forgot password and resetting the password
  export const forgotPassword=z.object({
    email:z.string().email()
  })
  const resetPasswordSchema = z.object({ password: z.string().min(8).max(72) });


  //endpoint code for forgot password
  export const forgotPwd =asyncHandler(async(req,res,next) => {
    const parsed = forgotPassword.safeParse(req.body);
    if(!parsed.success) 
      return next(new AppError(parsed.error.issues[0].message,400));

    const user =await User.findOne({ //User.findOne() searches your database for a user with the submitted email address.
      email: parsed.data.email
    });

    if(!user){ //if (!user) checks whether user is null or otherwise falsy.
      return res.status(200).json({
        status:'success',
        message:'if the email is registered, a reset link has been generated'
      });
    }

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.passwordresetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  await user.save({ validateBeforeSave: false });

    // No email service wired up yet, so the raw token is returned here so the flow is testable.
  // In production this would be emailed as a link and never appear in the API response.
  res.status(200).json({
    status: 'success',
    message: 'If that email is registered, a reset link has been generated.',
    resetToken,
  });
});


//reset password token

export const resetPassword = asyncHandler(async (req, res, next) => {

  //req.body contains the data sent by the frontend,such as the new password.
  //the resetpasswordschema checks whether the data follows your validation rules
    const parsed = resetPasswordSchema.safeParse(req.body);

    //apperror sends a bad request when the safe parse validation fails
      if (!parsed.success) return next(new AppError(parsed.error.issues[0].message, 400));
 
      //req.params.token gets the original token from the URL.
      //update() provides the original token as input
      //digest('hex) produces the hash as a hexadecimal string
      const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  
      //here the query checks the 2 conditions
      //1. the token hash must match the hash stored for a user
      //2. the expiry time must be greater than the current time,meaning the token has not expired.
      //If the token matches and the expiry time is still in the future, findOne() returns the user document.
      //If the token is incorrect, expired, or no longer stored, it returns null.
    const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() }, //$gt is a mongodb operator meaning - greater than
  });

  if (!user) return next(new AppError('Token is invalid or has expired', 400));

   user.passwordHash = await bcrypt.hash(parsed.data.password, 12);
  user.passwordresetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res.status(200).json({ status: 'success', token: signToken(user.id, user.role) });

});
//next add the code in auth.routes.ts




  //here the "next" passes the control to the next middleware or forwards an error
export const register = asyncHandler(async (req, res, next) => {
 
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return next(new AppError(parsed.error.issues[0].message, 400));

  //parsed.data is the validated output retruned by the zod
  const { email, password, firstName, lastName, mobileNumber } = parsed.data;

  //check whether the email already exists
  if (await User.exists({ email })) return next(new AppError('Email already registered', 409));

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ email, passwordHash, firstName, lastName, mobileNumber });

  res.status(201).json({
    status: 'success',
    data: { id: user._id, email: user.email, firstName, lastName },
    token: signToken(user.id, user.role),
  });
});




export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user || !(await bcrypt.compare(password, user.passwordHash)))
    return next(new AppError('Invalid email or password', 401));

  res.status(200).json({ status: 'success', token: signToken(user.id, user.role) });
});


//authenticate the user and then allow to fetch the records
//req.user.sub means the user ID stored in the JWT (JSON Web Token) that was sent by the client and verified by the protect middleware.
//sub stands for subject
export const me = asyncHandler(async (req: any, res) => {
  const user = await User.findById(req.user.sub);
  res.status(200).json({ status: 'success', data: user });
});
