import express from 'express';
import cors from 'cors';
//helps secure your express application by setting http security headers
//it helps rowsers defend against certain attacks like cross-site scripting risks and clickjacking
import helmet from 'helmet';
import { globalErrorHandler, createRateLimiter } from '@eventflow/shared';
import { authRouter } from './routes/auth.routes';

export const app = express();
app.use(express.json(), cors(), helmet());

//this limits how frequently clients can send the requests — counted in Redis, so the limit
//stays correct even once this service runs as multiple processes/instances
app.use(createRateLimiter(15 * 60 * 1000, 100));
app.use('/', authRouter);
app.use(globalErrorHandler);


