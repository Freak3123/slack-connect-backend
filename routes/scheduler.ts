import { WebClient } from '@slack/web-api';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const userClient = new WebClient(process.env.SLACK_USER_TOKEN);

export const scheduleMessageDynamically = async (
  targetId: string,
  message: string,
  time?: string | Date
) => {
  try {
    let channelId: string;

    if (targetId.startsWith('U')) {
      const im = await userClient.conversations.open({ users: targetId });
      channelId = im.channel?.id || '';
      if (!channelId) throw new Error("Unable to open DM with user.");
    } else {
      channelId = targetId;
    }

    if (time) {
      const timestamp = Math.floor(
        (typeof time === 'string' ? new Date(time) : time).getTime() / 1000
      );

      const result = await userClient.chat.scheduleMessage({
        channel: channelId,
        text: message,
        post_at: timestamp,
      });

      console.log(`✅ Scheduled for ${new Date(timestamp * 1000).toLocaleString()}`);
      return {
        scheduled: true,
        scheduled_message_id: result.scheduled_message_id,
        channel: channelId,
        post_at: timestamp,
      };
    } else {
      const result = await userClient.chat.postMessage({
        channel: channelId,
        text: message,
      });

      console.log(`✅ Message sent immediately at ${new Date().toLocaleString()}`);
      return {
        scheduled: false,
        ts: result.ts,
        channel: channelId,
      };
    }
  } catch (error) {
    console.error("❌ Error sending/scheduling message:", error);
    throw error;
  }
};
