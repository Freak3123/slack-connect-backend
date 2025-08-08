import { WebClient } from '@slack/web-api';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const userClient = new WebClient(process.env.SLACK_USER_TOKEN);

export const deleteScheduledMessage = async (
  scheduled_message_id: string,
  channelId: string
) => {
  try {
    const result = await userClient.chat.deleteScheduledMessage({
      channel: channelId,
      scheduled_message_id,
    });

    console.log('✅ Scheduled message deleted successfully!');
    return result;
  } catch (error) {
    console.error('❌ Error deleting scheduled message:', error);
    throw error;
  }
};
