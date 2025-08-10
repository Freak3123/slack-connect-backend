import { Schema, model, models, Document } from "mongoose";

export interface ISlackInstallation extends Document {
  teamId: string;
  teamName: string;
  botToken?: string;
  botUserId?: string;
  userToken: string;
  installedAt: Date;
}

const SlackInstallationSchema = new Schema<ISlackInstallation>(
  {
    teamId: { type: String, required: true, unique: true },
    teamName: { type: String, required: true },
    botToken: { type: String },
    botUserId: { type: String },
    userToken: { type: String, required: true },
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
