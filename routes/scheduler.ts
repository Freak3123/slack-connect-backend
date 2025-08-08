import express from "express";
import { WebClient } from "@slack/web-api";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const router = express.Router();
const userClient = new WebClient(process.env.SLACK_USER_TOKEN);

router.post("/", async (req, res) => {
console.log(req.body);
  const { targetId, message, time } = req.body;


  if (!targetId || !message) {
    return res.status(400).json({ error: "Missing targetId or message." });
  }

  try {
    let channelId: string;

    // If user ID, open DM
    if (targetId.startsWith("U")) {
      const im = await userClient.conversations.open({ users: targetId });
      channelId = im.channel?.id || "";
      if (!channelId) throw new Error("Unable to open DM with user.");
    } else {
      channelId = targetId;
    }

    if (time) {



      const result = await userClient.chat.scheduleMessage({
        channel: channelId,
        text: message,
        post_at: time,
      });

      res.json({
        scheduled: true,
        scheduled_message_id: result.scheduled_message_id,
        channel: channelId,
        post_at: time,
      });
    } else {
      const result = await userClient.chat.postMessage({
        channel: channelId,
        text: message,
      });

      res.json({
        scheduled: false,
        ts: result.ts,
        channel: channelId,
      });
    }
  } catch (error) {
    console.error("❌ Error sending/scheduling message:", error);
    res.status(500).json({ error: "Failed to send or schedule message" });
  }
});

export default router;
