import express, { Request, Response } from "express";
import { WebClient } from "@slack/web-api";

const router = express.Router();

const userClient = new WebClient(process.env.SLACK_USER_TOKEN);

router.post("/", async (req: Request, res: Response) => {
  const { targetId, message } = req.body;

  if (!targetId || !message) {
    return res.status(400).json({ error: "Missing id or message" });
  }

  try {
    let channelId = targetId;

    if (targetId.startsWith("U")) {
      const im = await userClient.conversations.open({ users: targetId });
      channelId = im.channel?.id || "";
      if (!channelId) {
        throw new Error("Failed to get DM channel ID");
      }
    }

    await userClient.chat.postMessage({
      channel: channelId,
      text: message,
    });

    return res.json({ success: true, message: "Message sent!" });
  } catch (error) {
    console.error("❌ Error sending Slack message:", error);
    return res.status(500).json({ error: "Failed to send message" });
  }
});

export default router;
