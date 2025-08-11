import { Schema, model, models, Document } from "mongoose";

export interface ISlackInstallation extends Document {
  teamId: string;
  teamName: string;
  userToken: string;
  refreshToken?: String;
  tokenExpiresAt?: Date;
  installedAt: Date;
}

const SlackInstallationSchema = new Schema<ISlackInstallation>(
  {
    teamId: { type: String, required: true, unique: true },
    teamName: { type: String, required: true },
    userToken: { type: String, required: true },
    refreshToken: { type: String, required: false },
    tokenExpiresAt: { type: Date, required: false },
    installedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    collection: "slack_installations",
  }
);

const SlackInstallation =
  models.SlackInstallation ||
  model<ISlackInstallation>("SlackInstallation", SlackInstallationSchema);

export default SlackInstallation;
