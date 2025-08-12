import dotenv from "dotenv";
import mongoose from "mongoose";
import { InstallProvider } from "@slack/oauth";
import express, { Request, Response } from "express";
import SlackInstallation from "../models/SlackInstallation";
import axios from "axios";

dotenv.config();

if (!process.env.MONGO_URI) {
  throw new Error("Missing MONGO_URI in environment variables");
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

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
      scopes: [],
      userScopes: [
        "channels:read",
        "groups:read",
        "im:read",
        "mpim:read",
        "users:read",
        "chat:write",
        "team:read",
      ],
      metadata: "some_metadata",
    });
    console.log("Generated install URL:", url);
    
    res.redirect(url);
  } catch (err) {
    console.error("Error generating install URL:", err);
    res.status(500).send("Failed to start Slack installation");
  }
});

router.get("/oauth/callback", async (req: Request, res: Response) => {
  const code = req.query.code as string;
  console.log("-----");

  if (!code) {
    return res.status(400).json({ error: "Missing code parameter" });
  }

  try {
    // Exchange code for access tokens with Slack API
    const response = await axios.post(
      "https://slack.com/api/oauth.v2.access",
      new URLSearchParams({
        code,
        client_id: process.env.SLACK_CLIENT_ID || "",
        client_secret: process.env.SLACK_CLIENT_SECRET || "",
        redirect_uri: process.env.SLACK_REDIRECT_URI || "",
      }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );


    const data = response.data;
    console.log("Received access tokens:", response.data);

    if (!data.ok) {
      console.error("Slack OAuth error:", data.error);
      return res.status(400).json({ error: data.error });
    }

    // Calculate token expiration datetime
    const now = new Date();
    const expiresInSeconds = data.expires_in; // number of seconds token lasts
    console.log(expiresInSeconds);
    const tokenExpiresAt = new Date(now.getTime() + expiresInSeconds * 1000);

    const existingInstallation = await SlackInstallation.findOne({
      teamId: data.team.id,
    });
    console.log("Existing installation found:", existingInstallation);

    if (existingInstallation) {
      existingInstallation.userToken = data.authed_user.access_token;
      existingInstallation.refreshToken = data.authed_user.refresh_token; 
      existingInstallation.tokenExpiresAt = tokenExpiresAt; 
      existingInstallation.teamName = data.team.name;
      existingInstallation.userId = data.authed_user.id;
      await existingInstallation.save();
    } else {
      const installation = new SlackInstallation({
        teamId: data.team.id,
        teamName: data.team.name,
        userToken: data.authed_user.access_token,
        refreshToken: data.authed_user.refresh_token, 
        tokenExpiresAt,                      
        userId: data.authed_user.id,
      });
      await installation.save();
    }

    res.json({
      ok: true,
      team: {
        id: data.team.id,
        name: data.team.name,
      },
    });
  } catch (error) {
    console.error("Error during Slack OAuth token exchange:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
