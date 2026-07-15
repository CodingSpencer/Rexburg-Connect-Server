import mongoose from "mongoose";
import type { Db } from "mongodb";
import { toNodeHandler } from "better-auth/node";

import app from "./app.js";
import { initAuth, getAuth } from "./lib/auth.js";
import { loadEnv } from "./lib/env.js";

loadEnv();

const PORT = Number(process.env.PORT) || 5001;
const HOST = "0.0.0.0";

console.log(`🚀 Starting server on ${HOST}:${PORT}...`);

const seedTestUser = async () => {
  try {
    const auth = getAuth();
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

    // Initialize better-auth with the MongoDB adapter
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("MongoDB connection is not fully established.");
    }
    initAuth(db as unknown as Db);

    // Register better-auth routes AFTER auth is initialized
    // Express 5 (path-to-regexp v8) requires a named wildcard parameter
    app.all("/api/auth/*splat", toNodeHandler(getAuth()));

    await seedTestUser();

    app.listen(PORT, HOST, () => {
      console.log(`Server is running on http://${HOST}:${PORT}`);
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
