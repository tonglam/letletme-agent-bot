import { describe, expect, test } from "bun:test";

import { parseEnv } from "../../src/config/env.ts";

describe("parseEnv", () => {
  test("throws when the telegram bot token is missing", () => {
    expect(() => parseEnv({})).toThrow("TELEGRAM_BOT_TOKEN is required.");
  });

  test("parses valid env values and defaults", () => {
    expect(
      parseEnv({
        TELEGRAM_BOT_TOKEN: "token",
        PORT: "8026",
        TIMEZONE: "Australia/Perth",
        NOTIFICATION_API_TOKEN: "secret",
        DEFAULT_TEXT_NOTIFICATION_TARGET: "5365651891"
      })
    ).toEqual({
      telegramBotToken: "token",
      port: 8026,
      timezone: "Australia/Perth",
      notificationApiToken: "secret",
      defaultTextNotificationTarget: "5365651891"
    });
  });
});
