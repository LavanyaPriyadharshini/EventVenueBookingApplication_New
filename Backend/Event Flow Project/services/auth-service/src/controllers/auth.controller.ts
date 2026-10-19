import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { asyncHandler, AppError } from '@eventflow/shared';
//async handler is the wrapper that forwards errors from asynchronous express handlers to error-handling middleware
import { User } from '../models/user.model';

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
