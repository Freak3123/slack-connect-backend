import { App, ExpressReceiver } from "@slack/bolt";
import messageRouter from "./routes/getMessages";
import scheduleRouter from "./routes/scheduler";
import deleteRouter from "./routes/deleter";
import sendmag from "./routes/directmsg";
import installRouter from "./routes/install"; 
import recipient from "./routes/recipient";
import * as dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";


dotenv.config({ path: ".env.local" });

const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET || "",
});
receiver.router.use(cors());
receiver.router.use(express.json()); 
receiver.router.use("/messages", messageRouter);
receiver.router.use("/schedule", scheduleRouter);
receiver.router.use("/delete", deleteRouter);
receiver.router.use("/send", sendmag);
receiver.router.use("/slack", installRouter);
receiver.router.use("/recipient", recipient);

mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver,
});

(async () => {
  await app.start(process.env.PORT || 3001);
  console.log(`⚡️ Bolt app is running on port ${process.env.PORT || 3001}`);
})();