import SlackInstallation from "../models/SlackInstallation";
import axios from "axios";

export async function getValidAccessToken(teamId: string): Promise<string> {
  const installation = await SlackInstallation.findOne({ teamId });
  if (!installation) throw new Error("Slack installation not found");

  const now = new Date();

  // If tokenExpiresAt exists + valid for min 1 min = return current token
  if (
    installation.tokenExpiresAt &&
    installation.tokenExpiresAt.getTime() - now.getTime() > 60 * 1000
  ) {
    return installation.userToken;
  }

  // Token = or ~ expired => refresh it
  if (!installation.refreshToken) {
    throw new Error("No refresh token available, re-authentication required");
  }

  try {
    const params = new URLSearchParams({
      client_id: process.env.SLACK_CLIENT_ID || "",
      client_secret: process.env.SLACK_CLIENT_SECRET || "",
      grant_type: "refresh_token",
      refresh_token: installation.refreshToken,
    });

    const response = await axios.post(
      "https://slack.com/api/oauth.v2.access",
      params.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const data = response.data;

    if (!data.ok) {
      throw new Error(`Slack token refresh error: ${data.error}`);
    }

    // Save tokens + expiry
    const expiresIn = data.expires_in; // seconds until expiry
    const tokenExpiresAt = new Date(now.getTime() + expiresIn * 1000);

    installation.userToken = data.access_token;
    installation.refreshToken = data.refresh_token;
    installation.tokenExpiresAt = tokenExpiresAt;

    await installation.save();

    return installation.userToken;
  } catch (error) {
    console.error("Failed to refresh Slack access token:", error);
    throw error;
  }
}
