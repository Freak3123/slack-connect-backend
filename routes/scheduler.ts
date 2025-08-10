import express from "express";
import { WebClient } from "@slack/web-api";
import SlackInstallation from "../models/SlackInstallation";

const router = express.Router();

router.post("/", async (req, res) => {
  console.log("Incoming scheduled message request:", req.body);

  const { targetId, message, time, teamId } = req.body;

  if (!targetId || !message || !time || !teamId) {
    return res.status(400).json({
      error: "targetId, message, time, and teamId are required."
    });
  }

  try {
    const installation = await SlackInstallation.findOne({ teamId });
    if (!installation) {
      return res.status(404).json({ error: "Team not found" });
    }

    const client = new WebClient(installation.botToken);

    let channelId: string;
    let targetName: string;

    if (targetId.startsWith("U")) {
      const userInfo = await client.users.info({ user: targetId });
      targetName = userInfo.user?.real_name || userInfo.user?.name || "Unknown User";

      const im = await client.conversations.open({ users: targetId });
      channelId = im.channel?.id || "";
      if (!channelId) throw new Error("Unable to open DM with user.");
    } else {
      const channelInfo = await client.conversations.info({ channel: targetId });
      targetName = channelInfo.channel?.name || "Unknown Channel";
      channelId = targetId;
    }

    const result = await client.chat.scheduleMessage({
      channel: channelId,
      text: message,
      post_at: Number(time),
    });

    return res.json({
      success: true,
      scheduled_message_id: result.scheduled_message_id,
      channel: channelId,
      targetName,
      teamName: installation.teamName,
      post_at: time,
    });
  } catch (error: any) {
    console.error("❌ Error scheduling Slack message:", error.data || error);
    return res.status(500).json({ error: "Failed to schedule message" });
  }
});

export default router;
