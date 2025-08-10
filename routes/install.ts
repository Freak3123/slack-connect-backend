import dotenv from "dotenv";
import { InstallProvider } from "@slack/oauth";
import express, { Request, Response } from "express";
import SlackInstallation from "../models/SlackInstallation";

dotenv.config();

if (
  !process.env.SLACK_CLIENT_ID ||
  !process.env.SLACK_CLIENT_SECRET ||
  !process.env.SLACK_STATE_SECRET
) {
  throw new Error("Missing Slack OAuth environment variables in .env.local");
}

const router = express.Router();

const installer = new InstallProvider({
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  stateSecret: process.env.SLACK_STATE_SECRET,
});

// Start OAuth flow
router.get("/install", async (req: Request, res: Response) => {
  try {
    const url = await installer.generateInstallUrl({
      scopes: ["chat:write", "channels:read"],
      userScopes: [],
      metadata: "some_metadata",
    });
    res.redirect(url);
  } catch (err) {
    console.error("Error generating install URL:", err);
    res.status(500).send("Failed to start Slack installation");
  }
});

// Handle callback
router.get("/oauth_redirect", async (req: Request, res: Response) => {
  try {
    // Force the correct structure since the library returns `void`
    const result = (await installer.handleCallback(req, res)) as unknown as {
      team?: { id?: string; name?: string };
      bot?: { token?: string; userId?: string };
      user?: { token?: string };
    };

    const { team, bot, user } = result;

    if (!team?.id || !team?.name || !bot?.token) {
      throw new Error("Missing installation data");
    }

    // Save or update team installation
    await SlackInstallation.findOneAndUpdate(
      { teamId: team.id },
      {
        teamId: team.id,
        teamName: team.name,
        botToken: bot.token,
        botUserId: bot.userId,
        userToken: user?.token || null,
        installedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    // Redirect to frontend success page
    res.redirect(
      `${process.env.FRONTEND_URL}/slack/success?team=${encodeURIComponent(
        team.name
      )}`
    );
  } catch (error) {
    console.error("Error handling OAuth callback:", error);
    res.redirect(`${process.env.FRONTEND_URL}/slack/error`);
  }
});

export default router;
