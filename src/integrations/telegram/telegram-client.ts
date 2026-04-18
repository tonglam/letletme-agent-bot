import type { NotificationTarget } from "../../domain/notification.ts";

export type SendTextInput = {
  target: NotificationTarget;
  text: string;
};

export type SendPhotoInput = {
  target: NotificationTarget;
  imageUrl: string;
  caption?: string | undefined;
};

export interface TelegramClient {
  sendText(input: SendTextInput): Promise<void>;
  sendPhoto(input: SendPhotoInput): Promise<void>;
}

type Fetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

type TelegramBotApiClientOptions = {
  botToken: string;
  fetcher?: Fetcher;
};

type TelegramApiResponse = {
  ok: boolean;
  description?: string;
  error_code?: number;
};

export class TelegramApiError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: number | undefined;

  constructor(message: string, options: { statusCode: number; errorCode: number | undefined }) {
    super(message);
    this.name = "TelegramApiError";
    this.statusCode = options.statusCode;
    this.errorCode = options.errorCode;
  }
}

export class TelegramBotApiClient implements TelegramClient {
  private readonly fetcher: Fetcher;
  private readonly baseUrl: string;

  constructor(options: TelegramBotApiClientOptions) {
    this.fetcher = options.fetcher ?? fetch;
    this.baseUrl = `https://api.telegram.org/bot${options.botToken}`;
  }

  async sendText(input: SendTextInput): Promise<void> {
    await this.call("sendMessage", {
      chat_id: input.target,
      text: input.text
    });
  }

  async sendPhoto(input: SendPhotoInput): Promise<void> {
    const payload: Record<string, string | number> = {
      chat_id: input.target,
      photo: input.imageUrl
    };

    if (input.caption) {
      payload.caption = input.caption;
    }

    await this.call("sendPhoto", payload);
  }

  private async call(method: string, payload: Record<string, string | number>): Promise<void> {
    const response = await this.fetcher(`${this.baseUrl}/${method}`, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const body = (await parseJsonSafely(response)) as TelegramApiResponse | undefined;

    if (!response.ok || !body?.ok) {
      throw new TelegramApiError(body?.description ?? "Telegram request failed.", {
        statusCode: response.status,
        errorCode: body?.error_code
      });
    }
  }
}

async function parseJsonSafely(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return undefined;
  }

  return response.json();
}
