import express from 'express';
import { WebClient } from '@slack/web-api';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const router = express.Router();
const userClient = new WebClient(process.env.SLACK_USER_TOKEN);

router.get('/', async (req, res) => {
  const { id, type } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Missing required "id" parameter.' });
  }

  try {
    let channelId = id;
    if (id.startsWith('U')) {
      const im = await userClient.conversations.open({ users: id });
      channelId = im.channel?.id || '';
      if (!channelId) throw new Error('Failed to get DM channel');
    }

    const results: Record<string, any> = {};

    if (!type || type === 'scheduled') {
      const scheduled = await userClient.chat.scheduledMessages.list({
        channel: channelId,
      });
      results.scheduled = (scheduled.scheduled_messages || []).map((msg) => ({
        ...msg,
        scheduled_message_id: msg.id, // alias 'id' to 'scheduled_message_id'
      }));
    }

    if (!type || type === 'history') {
      const history = await userClient.conversations.history({
        channel: channelId,
        limit: 20,
      });
      results.history = history.messages;
    }

    res.json({
      channel: channelId,
      ...results,
    });
  } catch (error) {
    console.error('❌ Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

export default router;
