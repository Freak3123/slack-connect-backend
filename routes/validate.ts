import express from "express";
import { getValidAccessToken } from "../lib/tokenValidity";

const router = express.Router();

router.get("/validate/:teamId", async (req, res) => {
  try {
    const teamId = req.params.teamId;
    if (!teamId) return res.status(400).json({ connected: false });

    await getValidAccessToken(teamId); // will refresh if needed
    res.json({ connected: true });
  } catch (err) {
    console.error("Validation error:", err);
    res.json({ connected: false });
  }
});

export default router;
