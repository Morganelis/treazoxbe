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

app.use(
  cors({
    origin: "*", // later restrict to frontend
    methods: ["GET", "POST", "PUT", "DELETE"],
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
