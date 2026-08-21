import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { connectDB } from "./config/db.js";

import authRoutes from "./routes/auth.js";
import entriesRoutes from "./routes/entries.js";
import settingsRoutes from "./routes/settings.js";
import analyticsRoutes from "./routes/analytics.js";
import starsRoutes from "./routes/stars.js";

dotenv.config();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://personal-tracker-ri3o.onrender.com",
  "https://localhost",
  "http://10.119.198.108:5173/",
  "capacitor://localhost",
];

const app = express();
// app.use(cors({ origin: process.env.CLIENT_ORIGIN || "*" }));
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin
      // (Postman, native apps, etc.)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error(`CORS blocked: ${origin}`)
      );
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/entries", entriesRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/stars", starsRoutes);

// Central error handler — so a thrown error never crashes the process silently
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Something went wrong" });
});

const PORT = Number(process.env.PORT || 4000);
const server = http.createServer(app);

function startServer(port) {
  const onError = (err) => {
    if (err.code === "EADDRINUSE" && port < 4010) {
      console.warn(`Port ${port} is busy, trying ${port + 1}...`);
      server.removeListener("error", onError);
      startServer(port + 1);
      return;
    }

    console.error("Failed to start server:", err.message);
    process.exit(1);
  };

  server.once("error", onError);
  server.listen(port, () => {
    console.log(`🌷 API running on http://localhost:${port}`);
  });
}

connectDB()
  .then(() => {
    startServer(PORT);
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
  });
