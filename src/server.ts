import mongoose from "mongoose";

import app from "./app.js";
import { auth } from "./lib/auth.js";
import { loadEnv } from "./lib/env.js";

loadEnv();

const PORT = process.env.PORT || 5001;

const seedTestUser = async () => {
  try {
    const user = await auth.api.signUpEmail({
      body: {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      },
    });

    console.log("🌱 Test user created successfully:", user);
  } catch {
    console.log(
      "ℹ️ Test user signup bypassed because it likely already exists."
    );
  }
};

const startServer = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error("MONGO_URI is missing from the .env file.");
    }

    await mongoose.connect(mongoUri);

    console.log("✅ Successfully connected to MongoDB Atlas!");

    await seedTestUser();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("❌ Server startup error:", error.message);
    } else {
      console.error("❌ Unknown server startup error:", error);
    }

    process.exit(1);
  }
};

void startServer();