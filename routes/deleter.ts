import express from "express";
import { WebClient } from "@slack/web-api";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const router = express.Router();
const userClient = new WebClient(process.env.SLACK_USER_TOKEN);

router.delete("/delete-scheduled", async (req, res) => {
  const { scheduled_message_id, channelId } = req.body;

  if (!scheduled_message_id || !channelId) {
    return res.status(400).json({ error: "Missing required parameters." });
  }

  try {
    const result = await userClient.chat.deleteScheduledMessage({
      channel: channelId,
      scheduled_message_id,
    });
    res.json({ success: true, result });
  } catch (error) {
    console.error("❌ Error deleting scheduled message:", error);
    res.status(500).json({ error: "Failed to delete scheduled message" });
  }
});

export default router;
