import express from "express";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
dotenv.config();
const prisma = new PrismaClient();
const app = express();
const PORT: any = process.env.PORT;

async function startServer() {
  try {
    await prisma.$connect();
    console.log("Database is connected");
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error: any) {
    console.error("Failed to connect to Database:", error.message);
  }
}
startServer();
