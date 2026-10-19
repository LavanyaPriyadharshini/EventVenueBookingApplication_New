import { Router } from 'express';
import { protect } from '@eventflow/shared';
import { register, login, me } from '../controllers/auth.controller';

export const authRouter = Router();
authRouter.post('/register', register);
authRouter.post('/login', login);

//here the protect is given because the endpoint can only be accessible by the authenticated user
//protect - verify the authentication, then return the user's profile
authRouter.get('/me', protect, me);
