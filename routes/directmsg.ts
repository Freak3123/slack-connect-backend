import express, { Request, Response } from "express";
import { WebClient } from "@slack/web-api";
import SlackInstallation from "../models/SlackInstallation";

const router = express.Router();

router.post("/", async (req, res) => {
  const { targetId, message, teamId } = req.body;
  if (!targetId || !message || !teamId) {
    return res.status(400).json({ error: "Missing targetId, message, or teamId" });
  }

  try {
    const installation = await SlackInstallation.findOne({ teamId });
    if (!installation) throw new Error("Team not found");

    const client = new WebClient(installation.botToken);
    let channelId = targetId;

    if (targetId.startsWith("U")) {
      const im = await client.conversations.open({ users: targetId });
      channelId = im.channel?.id || "";
      if (!channelId) throw new Error("Failed to get DM channel ID");
    }

    await client.chat.postMessage({ channel: channelId, text: message });
    res.json({ success: true, message: "Message sent!" });
  } catch (error) {
    console.error("❌ Error sending Slack message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

export default router;
