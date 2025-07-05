import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express from "express";
dotenv.config();  
import cors from "cors";

import authRoutes from "./routes/auth.route.js";
import chatRoutes from "./routes/chat.route.js";
import userRoutes from "./routes/user.route.js";


import { connectDB } from "./lib/db.js";

const app = express();
const PORT = process.env.PORT || 5001; 

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true, // Allow cookies to be sent with requests
}));
app.use(express.json());  
app.use(cookieParser());
 

app.use("/api/auth", authRoutes)
app.use("/api/user", userRoutes)
app.use("/api/chat", chatRoutes)

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
