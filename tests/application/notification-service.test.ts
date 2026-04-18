import { describe, expect, test } from "bun:test";

import { NotificationService } from "../../src/application/services/notification-service.ts";
import type { TelegramClient } from "../../src/integrations/telegram/telegram-client.ts";

describe("NotificationService", () => {
  test("sends text notifications through the message path", async () => {
    const calls: Array<{ kind: string; target: string | number; text?: string | undefined; imageUrl?: string | undefined; caption?: string | undefined }> = [];
    const client: TelegramClient = {
      sendText: async ({ target, text }) => {
        calls.push({ kind: "text", target, text });
      },
      sendPhoto: async ({ target, imageUrl, caption }) => {
        calls.push({ kind: "image", target, imageUrl, caption });
      }
    };

    const service = new NotificationService(client);

    const result = await service.send({
      type: "text",
      targets: ["1001", 1002],
      text: "hello"
    });

    expect(result).toEqual({
      status: "success",
      notificationType: "text",
      requestedCount: 2,
      deliveredCount: 2,
      failedCount: 0,
      failures: []
    });
    expect(calls).toEqual([
      { kind: "text", target: "1001", text: "[letletme-telegram-bot] hello" },
      { kind: "text", target: 1002, text: "[letletme-telegram-bot] hello" }
    ]);
  });

  test("uses the configured default text target when none is provided", async () => {
    const calls: Array<{ kind: string; target: string | number; text?: string | undefined }> = [];
    const client: TelegramClient = {
      sendText: async ({ target, text }) => {
        calls.push({ kind: "text", target, text });
      },
      sendPhoto: async () => {
        throw new Error("sendPhoto should not be called");
      }
    };

    const service = new NotificationService(client, {
      defaultTextTarget: "5365651891"
    });

    const result = await service.send({
      type: "text",
      targets: [],
      text: "hello"
    });

    expect(result).toEqual({
      status: "success",
      notificationType: "text",
      requestedCount: 1,
      deliveredCount: 1,
      failedCount: 0,
      failures: []
    });
    expect(calls).toEqual([
      { kind: "text", target: "5365651891", text: "[letletme-telegram-bot] hello" }
    ]);
  });

  test("sends image notifications through the photo path and preserves caption", async () => {
    const calls: Array<{ kind: string; target: string | number; imageUrl?: string | undefined; caption?: string | undefined }> = [];
    const client: TelegramClient = {
      sendText: async () => {
        throw new Error("sendText should not be called");
      },
      sendPhoto: async ({ target, imageUrl, caption }) => {
        calls.push({ kind: "image", target, imageUrl, caption });
      }
    };

    const service = new NotificationService(client);

    const result = await service.send({
      type: "image",
      targets: ["@team-chat"],
      imageUrl: "https://example.com/image.png",
      caption: "latest chart"
    });

    expect(result.status).toBe("success");
    expect(calls).toEqual([
      {
        kind: "image",
        target: "@team-chat",
        imageUrl: "https://example.com/image.png",
        caption: "latest chart"
      }
    ]);
  });
});
