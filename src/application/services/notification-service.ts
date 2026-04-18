import type { NotificationFailure, NotificationRequest, NotificationResult } from "../../domain/notification.ts";
import type { TelegramClient } from "../../integrations/telegram/telegram-client.ts";

export interface NotificationServicePort {
  send(notification: NotificationRequest): Promise<NotificationResult>;
}

export class NotificationService implements NotificationServicePort {
  constructor(private readonly telegramClient: TelegramClient) {}

  async send(notification: NotificationRequest): Promise<NotificationResult> {
    const failures: NotificationFailure[] = [];

    for (const target of notification.targets) {
      try {
        if (notification.type === "text") {
          await this.telegramClient.sendText({
            target,
            text: notification.text
          });
        } else {
          await this.telegramClient.sendPhoto({
            target,
            imageUrl: notification.imageUrl,
            caption: notification.caption
          });
        }
      } catch (error) {
        failures.push({
          target,
          message: error instanceof Error ? error.message : "Unknown delivery error."
        });
      }
    }

    const requestedCount = notification.targets.length;
    const failedCount = failures.length;
    const deliveredCount = requestedCount - failedCount;

    return {
      status: failedCount === 0 ? "success" : "partial_failure",
      notificationType: notification.type,
      requestedCount,
      deliveredCount,
      failedCount,
      failures
    };
  }
}
