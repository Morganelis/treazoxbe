import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "../config/db.js";
import userRoutes from "../routes/userRoutes.js";
import initAdmin from "../config/initAdmin.js";

dotenv.config();

const app = express();

// ------------------ Database ------------------
await connectDB();

// ------------------ Middlewares ------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = [
  "http://localhost:3000",             // Local Next.js frontend
  "https://treazoxfrontend.vercel.app",  // Vercel frontend
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like Postman) or from allowedOrigins
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // if you need cookies/auth
  })
);

// ------------------ Routes ------------------
app.use("/api/users",userRoutes );

// ------------------ Admin Init ------------------
await initAdmin();

// ------------------ Health Check ------------------
app.get("/", (req, res) => {
  res.json({ success: true, message: "Backend running on Vercel 🚀" });
});

export default app; // ESM export
