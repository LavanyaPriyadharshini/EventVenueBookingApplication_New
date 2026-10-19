import 'dotenv/config';
import { app } from './app';
import { connectDB } from './config/db';

connectDB().then(() => {
  app.listen(process.env.PORT, () => console.log(`auth-service on ${process.env.PORT}`));
});
