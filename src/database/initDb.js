import { MongoClient, ServerApiVersion } from "mongodb";
import { products as eventsData } from "./database/events.js";
import * as argon2 from "argon2";

const uri = process.env.MONGO_URI || "";
const dbName = process.env.MONGO_DATABASE || "rexburg_connect";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
});

// Helper function to safely drop a collection only if it currently exists
const safeDropCollection = async (db, name) => {
  const collections = await db.listCollections({ name }).toArray();
  if (collections.length > 0) {
    await db.collection(name).drop();
    console.log(`🧹 Dropped existing collection: '${name}'`);
  }
};

const init = async () => {
  try {
    await client.connect();
    console.log(`🚀 Connected to MongoDB Atlas! Target: "${dbName}"`);
    const db = client.db(dbName);

    // 1. Drop old Rexburg Connect collections to start completely fresh
    await safeDropCollection(db, "users");
    await safeDropCollection(db, "profiles");
    await safeDropCollection(db, "events");
    await safeDropCollection(db, "reviews");

    // 2. Re-create core collections cleanly
    await db.createCollection("users");
    await db.createCollection("profiles");
    await db.createCollection("events");
    await db.createCollection("reviews");
    console.log("📦 Core collections initialized successfully.");

    // 3. Seed users & their profile metadata
    await seedUsersAndProfiles(db);

    // 4. Seed the campus events collection
    await seedEvents(db);

  } catch (error) {
    console.error("❌ Initialization error:", error.message);
  } finally {
    await client.close();
    console.log("🔒 Database connection securely closed.");
  }
};

const lowerCaseKeys = function (obj) {
  if (typeof obj === "object" && obj !== null && !Array.isArray(obj)) {
    const newObj = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const newKey = key[0].toLowerCase() + key.slice(1);
        if (typeof obj[key] === "object" && obj[key] !== null) {
          newObj[newKey] = lowerCaseKeys(obj[key]);
        } else {
          newObj[newKey] = obj[key];
        }
      }
    }
    return newObj;
  } else if (Array.isArray(obj)) {
    return obj.map(item => typeof item === "object" ? lowerCaseKeys(item) : item);
  }
  return obj;
};

const seedEvents = async (db) => {
  const transformedEvents = eventsData.map((eventObj) => {
    const eventCopy = JSON.parse(JSON.stringify(eventObj));
    
    if (!eventCopy.Reviews) eventCopy.Reviews = {};
    eventCopy.Reviews.ReviewsUrl = `/api/events/${eventCopy.Id || eventCopy.id}/reviews`;
    
    return lowerCaseKeys(eventCopy);
  });

  try {
    const result = await db.collection("events").insertMany(transformedEvents);
    console.log(`✅ ${result.insertedCount} campus events successfully seeded!`);

    await db.collection("events").createIndex({ id: 1 });
    await db.collection("events").createIndex({ title: 1 });
    await db.collection("events").createIndex({ averagerating: -1 }); 
  } catch (error) {
    console.error("❌ Event seeding error:", error.message);
  }
};

const seedUsersAndProfiles = async (db) => {
  await db.collection("users").createIndex({ email: 1 }, { unique: true });
  await db.collection("profiles").createIndex({ userId: 1 });
  await db.collection("profiles").createIndex({ username: 1 }, { unique: true });

  const passwordHash = await argon2.hash("password123");

  const mockUser = {
    name: "Test Student",
    email: "student@byui.edu",
    passwordHash: passwordHash,
    createdDate: new Date()
  };

  try {
    const userResult = await db.collection("users").insertOne(mockUser);
    console.log(`👤 Base credentials registered with ID: ${userResult.insertedId}`);

    const mockProfile = {
      userId: userResult.insertedId,
      username: "byui_coder",
      reviews: [],
      verified: true
    };

    const profileResult = await db.collection("profiles").insertOne(mockProfile);
    console.log(`📋 Connected user profile created with ID: ${profileResult.insertedId}`);
  } catch (error) {
    console.error("❌ User/Profile seeding error:", error.message);
  }
};

init();