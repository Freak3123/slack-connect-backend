import { App, ExpressReceiver } from "@slack/bolt";
import { WebClient } from "@slack/web-api";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { scheduleMessageDynamically } from "./routes/scheduler";

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  port: Number(process.env.PORT) || 3000,
});

// //Bot sends Hi <user> whenever sees 'Hello'
// app.message("hello", async ({ message, say }) => {
//   const user = (message as any).user;
//   await say(`Hey there <@${user}>!`);
// });

// //from user account
const userClient = new WebClient(process.env.SLACK_USER_TOKEN);

// const sendMessageUsingUserToken = async () => {
//   try {
//     const userId = process.env.SLACK_USER_ID;
//     if (!userId) {
//       throw new Error(
//         "SLACK_USER_ID is not defined in your environment variables."
//       );
//     }
//     const im = await userClient.conversations.open({ users: userId });
//     const channelId = im.channel?.id;

//     if (!channelId) {
//       throw new Error("Failed to get DM channel ID");
//     }

//     await userClient.chat.postMessage({
//       channel: channelId,
//       text: "Hi, It's me! your HOPE",
//     });

//     console.log("✅ Message sent successfully!");
//   } catch (error) {
//     console.error("❌ Error sending message:", error);
//   }
// };

// const sendMessageToChannel = async () => {
//   try {
//     const channelId = process.env.SLACK_CHANNEL_ID;
//     if (!channelId) {
//       throw new Error(
//         "Channel_ID is not defined in your environment variables."
//       );
//     }

//     await userClient.chat.postMessage({
//       channel: channelId,
//       text: "Hi, It's me! your HOPE",
//     });

//     console.log("✅ Message sent from user to channel!");
//   } catch (error) {
//     console.error("❌ Failed to send message:", error);
//   }
// };

// const scheduleMessageDynamically = async (
//   targetId: string,
//   message: string,
//   scheduledTime: string | Date
// ) => {
//   try {
//     const timestamp = Math.floor(
//       (typeof scheduledTime === 'string' ? new Date(scheduledTime) : scheduledTime).getTime() / 1000
//     );

//     let channelId: string;

//     if (targetId.startsWith('U')) {
//       const im = await userClient.conversations.open({ users: targetId });
//       channelId = im.channel?.id || '';
//       if (!channelId) throw new Error("Unable to open DM with user.");
//     } else {
//       channelId = targetId;
//     }

//     const result = await userClient.chat.scheduleMessage({
//       channel: channelId,
//       text: message,
//       post_at: timestamp,
//     });

//     console.log(`✅ Message scheduled for ${new Date(timestamp * 1000).toLocaleString()}`);
//     console.log(`📩 Target: ${channelId}`);
//   } catch (error) {
//     console.error("❌ Error scheduling message:", error);
//   }
// };

// (async () => {
//   await app.start();
//   app.logger.info("⚡️ Bolt app is running!");
//   await scheduleMessageDynamically(process.env.SLACK_USER_ID!, "Hi, hmmm");
// })();
