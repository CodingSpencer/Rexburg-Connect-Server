import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import mongoose from 'mongoose';

import { toNodeHandler } from "better-auth/node";
import { auth } from './lib/auth.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.all('api/auth/*', toNodeHandler(auth));

app.use(express.json());

// Connect to MongoDB with error typing
mongoose.connect(process.env.MONGO_URI || '')
  .then(() => console.log('✅ Successfully connected to MongoDB Atlas!'))
  .catch((err: unknown) => {
    if (err instanceof Error) {
      console.error('❌ MongoDB connection error:', err.message);
    } else {
      console.error('❌ Unknown MongoDB connection error:', err);
    }
  });

// Sample route
app.get('/', (_req: Request, res: Response) => {
  res.send('Server is running and database is connected!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});