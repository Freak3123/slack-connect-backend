import express from "express";
import { WebClient } from "@slack/web-api";
import SlackInstallation from "../models/SlackInstallation";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const router = express.Router();
//const userClient = new WebClient(process.env.SLACK_USER_TOKEN);

console.log("Deleter route initialized");

router.delete("/", async (req, res) => {
  const { scheduled_message_id, channelId, teamId } = req.body;

  if (!scheduled_message_id || !channelId || !teamId) {
    return res
      .status(400)
      .json({
        error: "scheduled_message_id , channelId and teamId are required.",
      });
  }
  try {
    const installation = await SlackInstallation.findOne({ teamId });
    if (!installation) throw new Error("Team not found");

    const client = new WebClient(installation.botToken);

    const result = await client.chat.deleteScheduledMessage({
      channel: channelId,
      scheduled_message_id,
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
