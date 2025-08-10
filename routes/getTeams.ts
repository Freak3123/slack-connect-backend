import express, { Request, Response } from "express";
import { WebClient } from "@slack/web-api";
import SlackInstallation from "../models/SlackInstallation";

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    console.log("ljouishiudbhjdgbjhdgbyjhdgyf")
    const teams = await SlackInstallation.find({}, { teamId: 1, teamName: 1, _id: 0 });

    if (!teams.length) {
      return res.status(404).json({ error: "No teams found" });
    }
    console.log(teams)
    res.json({ teams });

  } catch (error) {
    console.error("❌ Error fetching teams:", error);
    res.status(500).json({ error: "Failed to fetch teams" });
  }
});

export default router;
