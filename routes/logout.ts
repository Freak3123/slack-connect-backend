import express, { Request, Response } from "express";
import SlackInstallation from "../models/SlackInstallation";

const router = express.Router();

router.post("/logout/:teamId", async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    console.log(req.params)
    await SlackInstallation.deleteOne({ teamId });

    res.json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

export default router;
