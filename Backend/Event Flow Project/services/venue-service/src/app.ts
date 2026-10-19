import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { globalErrorHandler, createRateLimiter } from '@eventflow/shared';
import { venueRouter } from './routes/venue.routes';
import { sectionRouter } from './routes/section.routes';
import { rowRouter } from './routes/row.routes';
import { seatRouter } from './routes/seat.routes';

export const app = express();
app.use(express.json(), cors(), helmet());

//this provides separate limiter instance for this separate service 
//Nothing from auth-service's limiter carries over automatically.
app.use(createRateLimiter(15 * 60 * 1000, 100));

app.use('/', venueRouter);
app.use('/sections', sectionRouter);
app.use('/rows', rowRouter);
app.use('/seats', seatRouter);

app.use(globalErrorHandler);
