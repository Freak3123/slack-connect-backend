import express from "express";
import { WebClient } from "@slack/web-api";
import SlackInstallation from "../models/SlackInstallation";

const router = express.Router();

router.get("/", async (req, res) => {
  const { id, type, teamId } = req.query;

  if (!id || typeof id !== "string" || !teamId || typeof teamId !== "string") {
    return res.status(400).json({
      error: 'Missing required parameters: "id" and "teamId" are required.'
    });
  }

  try {
    const installation = await SlackInstallation.findOne({ teamId });
    if (!installation) {
      return res.status(404).json({ error: "Team not found" });
    }

    const client = new WebClient(installation.userToken);


    let channelId = id;
    let targetName = "";

    if (id.startsWith("U")) {
      const userInfo = await client.users.info({ user: id });
      targetName = userInfo.user?.real_name || userInfo.user?.name || "Unknown User";

      const im = await client.conversations.open({ users: id });
      channelId = im.channel?.id || "";
      if (!channelId) throw new Error("Failed to get DM channel");
    } else {
      const channelInfo = await client.conversations.info({ channel: id });
      targetName = channelInfo.channel?.name || "Unknown Channel";
    }

    const results: Record<string, any> = {};

    if (!type || type === "scheduled") {
      const scheduled = await client.chat.scheduledMessages.list({ channel: channelId });
      results.scheduled = (scheduled.scheduled_messages || []).map((msg) => ({
        ...msg,
        scheduled_message_id: msg.id,
      }));
    }

    if (!type || type === "history") {
      const history = await client.conversations.history({
        channel: channelId,
        limit: 20,
      });
      results.history = history.messages;
    }

    res.json({
      teamName: installation.teamName,
      targetName,
      channel: channelId,
      ...results,
    });
  } catch (error) {
    console.error("❌ Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

export default router;
