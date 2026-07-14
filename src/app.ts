import express from "express";
import cors from "cors";

import routes from "./routes/index.mjs";

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

app.use(express.json());

// All other backend routes
app.use("/api", routes);

export default app;
