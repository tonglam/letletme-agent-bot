import { describe, expect, test } from "bun:test";

import { createApp } from "../../src/http/create-app.ts";
import type { NotificationServicePort } from "../../src/application/services/notification-service.ts";

describe("notification route", () => {
  test("accepts a valid text notification request", async () => {
    const service: NotificationServicePort = {
      send: async (notification) => ({
        status: "success",
        notificationType: notification.type,
        requestedCount: notification.targets.length,
        deliveredCount: notification.targets.length,
        failedCount: 0,
        failures: []
      })
    };

    const app = createApp({
      notificationService: service,
      apiToken: undefined
    });

    const response = await app.handle(
      new Request("http://localhost/telegramBot/letletme/notification", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          type: "text",
          targets: ["1001"],
          text: "hello"
        })
      })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      status: "success",
      notificationType: "text",
      requestedCount: 1,
      deliveredCount: 1,
      failedCount: 0,
      failures: []
    });
  });

  test("accepts a valid image notification request with caption", async () => {
    const service: NotificationServicePort = {
      send: async (notification) => ({
        status: "success",
        notificationType: notification.type,
        requestedCount: notification.targets.length,
        deliveredCount: notification.targets.length,
        failedCount: 0,
        failures: []
      })
    };

    const app = createApp({
      notificationService: service,
      apiToken: undefined
    });

    const response = await app.handle(
      new Request("http://localhost/telegramBot/letletme/notification", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          type: "image",
          targets: ["1001"],
          imageUrl: "https://example.com/chart.png",
          caption: "price update"
        })
      })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      status: "success",
      notificationType: "image",
      requestedCount: 1,
      deliveredCount: 1,
      failedCount: 0,
      failures: []
    });
  });

  test("rejects invalid notification payloads", async () => {
    const service: NotificationServicePort = {
      send: async () => {
        throw new Error("send should not be called");
      }
    };

    const app = createApp({
      notificationService: service,
      apiToken: undefined
    });

    const response = await app.handle(
      new Request("http://localhost/telegramBot/letletme/notification", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          type: "image",
          targets: [],
          imageUrl: ""
        })
      })
    );

    expect(response.status).toBe(422);
  });

  test("rejects unauthorized callers when an API token is configured", async () => {
    const service: NotificationServicePort = {
      send: async () => {
        throw new Error("send should not be called");
      }
    };

    const app = createApp({
      notificationService: service,
      apiToken: "secret"
    });

    const response = await app.handle(
      new Request("http://localhost/telegramBot/letletme/notification", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          type: "text",
          targets: ["1001"],
          text: "hello"
        })
      })
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      code: "unauthorized",
      message: "Missing or invalid bearer token."
    });
  });
});
