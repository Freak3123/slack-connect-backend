import express from "express";
import { WebClient } from "@slack/web-api";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const router = express.Router();
const userClient = new WebClient(process.env.SLACK_USER_TOKEN);

router.post("/", async (req, res) => {
  console.log("Incoming scheduled message request:", req.body);

  const { targetId, message, time } = req.body;

  if (!targetId || !message || !time) {
    return res.status(400).json({ error: "targetId, message, and time are required." });
  }

  try {
    let channelId: string;

    if (targetId.startsWith("U")) {
      const im = await userClient.conversations.open({ users: targetId });
      channelId = im.channel?.id || "";
      if (!channelId) {
        throw new Error("Unable to open DM with user.");
      }
    } else {
      channelId = targetId;
    }

    const result = await userClient.chat.scheduleMessage({
      channel: channelId,
      text: message,
      post_at: Number(time),
    });

    return res.json({
      success: true,
      scheduled_message_id: result.scheduled_message_id,
      channel: channelId,
      post_at: time,
    });

  } catch (error: any) {
    console.error("❌ Error scheduling Slack message:", error.data || error);
    return res.status(500).json({ error: "Failed to schedule message" });
  }
});

export default router;
