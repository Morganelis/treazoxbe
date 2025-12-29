import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "../config/db.js";
import initAdmin from "../config/initAdmin.js";

import routes from "../routes/index.js";

dotenv.config();

const app = express();

// ------------------ Database ------------------
await connectDB();
await initAdmin();

// ------------------ Middlewares ------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use(
//   cors({
//     origin: "*", // later you can restrict this
//     methods: ["GET", "POST", "PUT", "DELETE"],
//   })
// );
app.use(cors())

// ------------------ Routes ------------------
app.use("/api", routes);

// ------------------ Health Check ------------------
app.get("/", (req, res) => {
  res.json({ success: true, message: "Backend running on Vercel 🚀" });
});

// IMPORTANT: no app.listen()
export default app;
