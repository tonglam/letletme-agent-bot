# Deployment Guide

## Server & Runtime
- Target host: `43.163.91.9`
- Runtime: Bun 1.2.12 or compatible
- App home: `/home/workspace/letletme-agent-bot`

## Directory Layout
```
/home/workspace/letletme-agent-bot
├── dist/          # bundled Bun output
├── logs/          # console logs
├── run/           # PID tracking
├── scripts/       # start/stop/rerun/monitor helpers
└── .env           # exported env vars
```

Create the tree on first deploy:
```bash
mkdir -p /home/workspace/letletme-agent-bot/{dist,logs,run,scripts}
```

## Environment Variables
Put secrets in `/home/workspace/letletme-agent-bot/.env` and guard permissions (`chmod 600`).

Required:
```bash
TELEGRAM_BOT_TOKEN=***
```

Optional:
```bash
PORT=3000
TIMEZONE=UTC
NOTIFICATION_API_TOKEN=***
```

## Runtime Scripts
- `./scripts/start.sh` starts the bundled Bun service and records the PID.
- `./scripts/stop.sh` stops the recorded PID.
- `./scripts/rerun.sh` stops then starts the service.
- `./scripts/monitor.sh [-f]` shows status and recent logs or tails the console log.

## GitHub Actions Secrets
Configure these repository secrets for deployment:
```bash
DEPLOY_HOST=43.163.91.9
DEPLOY_USERNAME=<deploy user>
DEPLOY_SSH_KEY=<private key>
```
