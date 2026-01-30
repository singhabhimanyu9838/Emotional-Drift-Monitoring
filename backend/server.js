import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import authRoutes from "./routes/auth.js";
import chatRoutes from "./routes/chat.js";


dotenv.config();
connectDB();

const app = express();
app.use(cors({
  origin: "*"
}));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

app.listen(5000, () => console.log("Server running on port 5000"));
