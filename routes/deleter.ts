import express from "express";
import { WebClient } from "@slack/web-api";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const router = express.Router();
const userClient = new WebClient(process.env.SLACK_USER_TOKEN);

console.log("Deleter route initialized");

router.delete("/", async (req, res) => {
  const { scheduled_message_id, channelId } = req.body;

  if (!scheduled_message_id || !channelId) {
    return res.status(400).json({ error: "scheduled_message_id and channelId are required." });
  }

  try {
    const result = await userClient.chat.deleteScheduledMessage({
      channel: channelId,
      scheduled_message_id: scheduled_message_id,
    });

    return res.json({
      success: true,
      deleted: true,
      result,
    });
  } catch (error: any) {
    console.error("❌ Error deleting scheduled message:", error.data || error);
    return res.status(500).json({
      error: "Failed to delete scheduled message",
      details: error.data?.error || error.message,
    });
  }
});

export default router;
