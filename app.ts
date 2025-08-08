import { App, ExpressReceiver } from "@slack/bolt";
import { WebClient } from "@slack/web-api";
import messageRouter from "./routes/getMessages";
import scheduleRouter from "./routes/scheduler";
import deleteRouter from "./routes/deleter";
import * as dotenv from "dotenv";
import express from "express";
import cors from "cors";


dotenv.config({ path: ".env.local" });

const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET || "",
});
receiver.router.use(cors());
receiver.router.use(express.json()); 


receiver.router.use("/", messageRouter);
receiver.router.use("/schedule", scheduleRouter);
receiver.router.use("/delete", deleteRouter);

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver,
});

const userClient = new WebClient(process.env.SLACK_USER_TOKEN);

(async () => {
  await app.start(process.env.PORT || 3001);
  console.log(`⚡️ Bolt app is running on port ${process.env.PORT || 3001}`);
})();