# letletme-agent-bot

`letletme-agent-bot` is a Bun + TypeScript + Elysia notification service that sends Telegram messages through the Telegram Bot API.

The current role of this project is notification delivery, not interactive command handling. Other systems call one HTTP endpoint, and this service turns those requests into Telegram text or image notifications.

## What It Does

- exposes one canonical notification endpoint: `POST /telegramBot/letletme/notification`
- sends text notifications with direct Telegram Bot API `sendMessage` calls
- sends image notifications with direct Telegram Bot API `sendPhoto` calls
- prefixes outbound text notifications as `[letletme-agent-bot] <content>`
- supports a default text destination through env when a text payload omits `targets`
- deploys to the VPS at `43.163.91.9`

## Tech Stack

- Bun
- TypeScript with strict compiler settings
- Elysia for the HTTP API
- direct `fetch` calls to the Telegram Bot API
- Bun test runner
- GitHub Actions for CI/CD

## API

### Endpoint

```http
POST /telegramBot/letletme/notification
Content-Type: application/json
Authorization: Bearer <token>   # optional, only when NOTIFICATION_API_TOKEN is configured
```

### Text Notification

`targets` is optional for text notifications. If omitted, the service uses `DEFAULT_TEXT_NOTIFICATION_TARGET` from env.

```json
{
  "type": "text",
  "text": "deployment finished",
  "targets": [5365651891]
}
```

Or, relying on the default text target:

```json
{
  "type": "text",
  "text": "deployment finished"
}
```

Delivered Telegram text format:

```text
[letletme-agent-bot] deployment finished
```

### Image Notification

`targets` is required for image notifications.

```json
{
  "type": "image",
  "imageUrl": "https://example.com/chart.png",
  "caption": "daily update",
  "targets": [5365651891]
}
```

### Response Shape

Successful delivery returns a summary like:

```json
{
  "status": "success",
  "notificationType": "text",
  "requestedCount": 1,
  "deliveredCount": 1,
  "failedCount": 0,
  "failures": []
}
```

Invalid payloads return `422`. Missing or invalid bearer tokens return `401` when auth is enabled.

## Environment

Required:

```bash
TELEGRAM_BOT_TOKEN=...
```

Common optional settings:

```bash
PORT=8026
TIMEZONE=Australia/Perth
NOTIFICATION_API_TOKEN=...
DEFAULT_TEXT_NOTIFICATION_TARGET=5365651891
BUN_CMD=/home/deploy/.bun/bin/bun
```

## Local Development

Install dependencies:

```bash
bun install
```

Run in watch mode:

```bash
bun run dev
```

Run tests:

```bash
bun test
```

Typecheck:

```bash
bun run typecheck
```

Build:

```bash
bun run build
```

## Deployment

The repo includes:

- `scripts/start.sh`
- `scripts/stop.sh`
- `scripts/rerun.sh`
- `scripts/monitor.sh`
- `.github/workflows/ci-cd.yml`

The VPS app home is:

```bash
/home/workspace/letletme-agent-bot
```

The live service currently runs on:

```bash
http://127.0.0.1:8026
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the VPS layout, env file, and GitHub Actions secret requirements.

## Current Boundaries

Included now:

- Telegram notification delivery
- HTTP API
- deployment scripts and CI/CD

Deferred for later:

- `/` bot commands
- polling runtime
- Redis-backed fan-out
- OpenAI/FPL integrations
