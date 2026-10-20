import { Router } from 'express';
import { protect } from '@eventflow/shared';
import { register, login, me,forgotPwd, resetPassword } from '../controllers/auth.controller';

export const authRouter = Router();
authRouter.post('/register', register);
authRouter.post('/login', login);

//here the protect is given because the endpoint can only be accessible by the authenticated user
//protect - verify the authentication, then return the user's profile
authRouter.get('/me', protect, me);

authRouter.post('/forgotPassword', forgotPwd);
authRouter.post('/resetPassword/:token', resetPassword);

//now move to the frontend
//components -> ui-> icons.tsx