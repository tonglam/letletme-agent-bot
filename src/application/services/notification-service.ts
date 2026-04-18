import type { NotificationFailure, NotificationRequest, NotificationResult } from "../../domain/notification.ts";
import type { TelegramClient } from "../../integrations/telegram/telegram-client.ts";

export interface NotificationServicePort {
  send(notification: NotificationRequest): Promise<NotificationResult>;
}

type NotificationServiceOptions = {
  defaultTextTarget?: string | undefined;
};

export class NotificationService implements NotificationServicePort {
  constructor(
    private readonly telegramClient: TelegramClient,
    private readonly options: NotificationServiceOptions = {}
  ) {}

  async send(notification: NotificationRequest): Promise<NotificationResult> {
    const failures: NotificationFailure[] = [];
    const targets = this.resolveTargets(notification);

    for (const target of targets) {
      try {
        if (notification.type === "text") {
          await this.telegramClient.sendText({
            target,
            text: this.formatText(notification.text)
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

    const requestedCount = targets.length;
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

  private resolveTargets(notification: NotificationRequest) {
    if (notification.targets.length > 0) {
      return notification.targets;
    }

    if (notification.type === "text" && this.options.defaultTextTarget) {
      return [this.options.defaultTextTarget];
    }

    return notification.targets;
  }

  private formatText(text: string) {
    return `[letletme-agent-bot] ${text}`;
  }
}
