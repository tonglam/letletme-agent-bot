export type AppEnv = {
  telegramBotToken: string;
  port: number;
  timezone: string;
  notificationApiToken: string | undefined;
  defaultTextNotificationTarget: string | undefined;
};

type EnvSource = Record<string, string | undefined>;

export function parseEnv(source: EnvSource): AppEnv {
  const telegramBotToken = source.TELEGRAM_BOT_TOKEN?.trim();
  if (!telegramBotToken) {
    throw new Error("TELEGRAM_BOT_TOKEN is required.");
  }

  const port = parseOptionalPort(source.PORT);

  return {
    telegramBotToken,
    port,
    timezone: source.TIMEZONE?.trim() || "UTC",
    notificationApiToken: source.NOTIFICATION_API_TOKEN?.trim() || undefined,
    defaultTextNotificationTarget: source.DEFAULT_TEXT_NOTIFICATION_TARGET?.trim() || undefined
  };
}

export function loadEnv(): AppEnv {
  return parseEnv(process.env);
}

function parseOptionalPort(value: string | undefined): number {
  if (!value) {
    return 3000;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error("PORT must be a positive integer.");
  }

  return parsed;
}
