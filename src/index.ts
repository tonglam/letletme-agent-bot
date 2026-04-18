import { NotificationService } from "./application/services/notification-service.ts";
import { loadEnv } from "./config/env.ts";
import { createApp } from "./http/create-app.ts";
import { TelegramBotApiClient } from "./integrations/telegram/telegram-client.ts";

const env = loadEnv();

const telegramClient = new TelegramBotApiClient({
  botToken: env.telegramBotToken
});

const notificationService = new NotificationService(telegramClient, {
  defaultTextTarget: env.defaultTextNotificationTarget
});

const app = createApp({
  notificationService,
  apiToken: env.notificationApiToken
});

app.listen(env.port);

console.log(`letletme-agent-bot listening on port ${env.port} (${env.timezone})`);
