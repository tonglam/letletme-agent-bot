# letletme-agent-bot

Bun and Elysia Telegram notification service.

## Scope

- v1 exposes a single HTTPS notification endpoint for Telegram text and image sends
- v1 uses direct Telegram Bot API calls instead of a bot framework
- future `/` bot commands will be added on top of the current transport boundaries
- deployment target remains the existing VPS at 43.163.91.9

## API

- `POST /telegramBot/letletme/notification`
