import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";

import routes from "./routes/index.mjs";
import { auth } from "./lib/auth.js";

const app = express();

const allowedOrigins = [
  "http://localhost:4321",
  "https://rexburg-connect-client.netlify.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// Better Auth routes
app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json());


// All other backend routes
app.use("/api", routes);

export default app;