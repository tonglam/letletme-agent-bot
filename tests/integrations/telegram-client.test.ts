import { afterEach, describe, expect, mock, test } from "bun:test";

import { TelegramApiError, TelegramBotApiClient } from "../../src/integrations/telegram/telegram-client.ts";

describe("TelegramBotApiClient", () => {
  afterEach(() => {
    mock.restore();
  });

  test("sends text notifications with the Telegram sendMessage payload", async () => {
    const fetchMock = mock(async (input: RequestInfo | URL, init?: RequestInit) => {
      expect(String(input)).toBe("https://api.telegram.org/bottoken/sendMessage");
      expect(init?.method).toBe("POST");
      expect(init?.headers).toEqual({
        "content-type": "application/json"
      });
      expect(init?.body).toBe(
        JSON.stringify({
          chat_id: "1001",
          text: "hello"
        })
      );

      return new Response(JSON.stringify({ ok: true, result: { message_id: 1 } }), {
        status: 200,
        headers: {
          "content-type": "application/json"
        }
      });
    });

    const client = new TelegramBotApiClient({ botToken: "token", fetcher: fetchMock });

    await client.sendText({
      target: "1001",
      text: "hello"
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test("sends image notifications with the Telegram sendPhoto payload", async () => {
    const fetchMock = mock(async (_input: RequestInfo | URL, init?: RequestInit) => {
      expect(init?.body).toBe(
        JSON.stringify({
          chat_id: "1001",
          photo: "https://example.com/chart.png",
          caption: "chart"
        })
      );

      return new Response(JSON.stringify({ ok: true, result: { message_id: 1 } }), {
        status: 200,
        headers: {
          "content-type": "application/json"
        }
      });
    });

    const client = new TelegramBotApiClient({ botToken: "token", fetcher: fetchMock });

    await client.sendPhoto({
      target: "1001",
      imageUrl: "https://example.com/chart.png",
      caption: "chart"
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test("raises a typed error when Telegram rejects a request", async () => {
    const fetchMock = mock(async () => {
      return new Response(JSON.stringify({ ok: false, description: "chat not found" }), {
        status: 400,
        headers: {
          "content-type": "application/json"
        }
      });
    });

    const client = new TelegramBotApiClient({ botToken: "token", fetcher: fetchMock });

    await expect(
      client.sendText({
        target: "1001",
        text: "hello"
      })
    ).rejects.toEqual(
      new TelegramApiError("chat not found", {
        statusCode: 400,
        errorCode: undefined
      })
    );
  });
});
