import express, { Request, Response } from "express";
import { WebClient } from "@slack/web-api";
import SlackInstallation from "../models/SlackInstallation";

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  const { teamId } = req.query;

  if (!teamId || typeof teamId !== "string") {
    return res.status(400).json({ error: "Missing teamId query parameter" });
  }

  try {
    const installation = await SlackInstallation.findOne({ teamId });
    if (!installation) return res.status(404).json({ error: "Team not found" });

    const client = new WebClient(installation.botToken);

    let users: Array<{ id: string; name: string }> = [];
    let cursor: string | undefined = undefined;
    do {
      const response = await client.users.list({ cursor, limit: 200 });
      if (response.members) {
        users.push(
          ...response.members
            .filter((u) => !u.is_bot && !u.deleted)
            .map((u) => ({ id: u.id!, name: u.real_name || u.name || "Unknown" }))
        );
      }
      cursor = response.response_metadata?.next_cursor || undefined;
    } while (cursor);

    let channels: Array<{ id: string; name: string }> = [];
    cursor = undefined;
    do {
      const response = await client.conversations.list({
        cursor,
        limit: 200,
        types: "public_channel,private_channel",
      });
      if (response.channels) {
        channels.push(
          ...response.channels.map((c) => ({
            id: c.id!,
            name: c.name || "Unknown Channel",
          }))
        );
      }
      cursor = response.response_metadata?.next_cursor || undefined;
    } while (cursor);

    return res.json({ users, channels, teamName: installation.teamName });
  } catch (error) {
    console.error("❌ Error fetching users and channels:", error);
    return res.status(500).json({ error: "Failed to fetch users and channels" });
  }
});

export default router;
