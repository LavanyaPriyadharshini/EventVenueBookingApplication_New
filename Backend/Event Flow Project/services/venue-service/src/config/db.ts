import mongoose from 'mongoose';
import process from 'node:process';

export const connectDB = () => mongoose.connect(process.env.MONGO_URI!);
