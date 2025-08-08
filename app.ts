import { App } from '@slack/bolt';

const app = new App({
  token: process.env.SLACK_BOT_TOKEN as string,
  signingSecret: process.env.SLACK_SIGNING_SECRET as string,
});

(async () => {
  const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  await app.start(port);
  app.logger.info(`⚡️ Bolt app is running on port ${port}!`);
})();
