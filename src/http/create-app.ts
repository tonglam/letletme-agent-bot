import { Elysia, t } from "elysia";

import type { NotificationServicePort } from "../application/services/notification-service.ts";

const targetSchema = t.Union([t.String(), t.Number()]);

const textNotificationSchema = t.Object({
  type: t.Literal("text"),
  targets: t.Array(targetSchema, { minItems: 1 }),
  text: t.String({ minLength: 1 })
});

const imageNotificationSchema = t.Object({
  type: t.Literal("image"),
  targets: t.Array(targetSchema, { minItems: 1 }),
  imageUrl: t.String({ minLength: 1, format: "uri" }),
  caption: t.Optional(t.String({ minLength: 1 }))
});

type CreateAppOptions = {
  notificationService: NotificationServicePort;
  apiToken: string | undefined;
};

export function createApp({ notificationService, apiToken }: CreateAppOptions) {
  return new Elysia()
    .post(
      "/telegramBot/letletme/notification",
      async ({ body, headers, set }) => {
        if (apiToken && !isAuthorized(headers.authorization, apiToken)) {
          set.status = 401;
          return {
            code: "unauthorized",
            message: "Missing or invalid bearer token."
          };
        }

        return notificationService.send(body);
      },
      {
        body: t.Union([textNotificationSchema, imageNotificationSchema])
      }
    );
}

function isAuthorized(header: string | undefined, expectedToken: string): boolean {
  if (!header) {
    return false;
  }

  return header === `Bearer ${expectedToken}`;
}
