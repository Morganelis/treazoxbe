import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import connectDB from "../config/db.js";
import userRoutes from "../routes/userRoutes.js";
import planRoutes from "../routes/planRoutes.js";
import investmentRoutes from "../routes/investmentRoutes.js"
import withdrawRoutes from "../routes/withdrawRoutes.js"
import depositRoutes from "../routes/depositRoutes.js"
import luckyDrawRoutes from "../routes/luckyDrawRoutes.js"
import accountHistoryRoutes from "../routes/accountHistoryRoutes.js"
import cronRoutes from "../routes/cronRoutes.js"




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
  "https://www.treazox.com",  // Vercel frontend
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
app.use("/api/plans",planRoutes );
app.use("/api/investment",investmentRoutes );
app.use("/api/withdraw",withdrawRoutes );
app.use("/api/deposit",depositRoutes );
app.use("/api/luckydraw",luckyDrawRoutes );
app.use("/api/accounthistory",accountHistoryRoutes );
app.use("/api/cron", cronRoutes);
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));








// ------------------ Admin Init ------------------
await initAdmin();

// ------------------ Health Check ------------------
app.get("/", (req, res) => {
  res.json({ success: true, message: "Backend running on Vercel 🚀" });
});


export default app; // ESM export
