import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import type { Request, Response } from 'express';
import mongoose from 'mongoose';

import { toNodeHandler } from "better-auth/node";
import { auth } from './lib/auth.js';

const app = express();

app.use(cors({
  origin: 'http://localhost:4321',
  credentials: true
}));

const PORT = process.env.PORT || 5000;

app.all(/\/api\/auth\/.*/, toNodeHandler(auth));

app.use(express.json());

const seedTestUser = async () => {
  try {
    const user = await auth.api.signUpEmail({
      body: {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      }
    });
    console.log("🌱 Test user created successfully:", user);
  } catch (error) {
    // If the user already exists, it will throw an error, which is fine for testing!
    console.log("ℹ️ Test user signup bypassed (likely already exists)");
  }
};

// Connect to MongoDB with error typing
mongoose.connect(process.env.MONGO_URI || '')
  .then(async () => {
    console.log('✅ Successfully connected to MongoDB Atlas!');
    
    // Call the seeding function here
    await seedTestUser();
  })
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